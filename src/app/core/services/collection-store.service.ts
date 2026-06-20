import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColeccionService } from './coleccion.service';
import { Vehiculo } from '../models/vehiculo.model';

/**
 * Estado compartido de la colección. Mantiene la lista de vehículos en un
 * signal para que la cuadrícula, el carrusel y el formulario trabajen sobre
 * la misma fuente de verdad y los cambios se reflejen al instante (guardado
 * optimista) sin esperar a recargar desde el backend.
 */
@Injectable({ providedIn: 'root' })
export class CollectionStore {
  private service = inject(ColeccionService);

  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  private loaded = false;

  load(): void {
    // Solo se muestra el spinner la primera vez; en visitas posteriores se
    // refresca en segundo plano mostrando los datos en caché mientras tanto.
    const first = !this.loaded;
    if (first) this.loading.set(true);
    this.error.set('');
    this.service.list().subscribe({
      next: (data) => {
        this.vehiculos.set(data);
        this.loaded = true;
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // No pisar los datos en caché si una recarga de fondo falla
        if (first) this.error.set(this.message(err));
        this.loading.set(false);
      },
    });
  }

  getById(id: string): Vehiculo | undefined {
    return this.vehiculos().find((v) => v.id === id);
  }

  /** Inserta un vehículo recién creado al inicio de la lista. */
  add(v: Vehiculo): void {
    this.vehiculos.update((list) => [v, ...list]);
  }

  /** Reemplaza un vehículo por su versión actualizada. */
  replace(v: Vehiculo): void {
    this.vehiculos.update((list) =>
      list.map((item) => (item.id === v.id ? v : item)),
    );
  }

  /** Aplica cambios parciales de forma optimista (texto, etc.). */
  patch(id: string, changes: Partial<Vehiculo>): void {
    this.vehiculos.update((list) =>
      list.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  /** Quita un vehículo y devuelve el estado anterior para poder revertir. */
  remove(id: string): Vehiculo[] {
    const prev = this.vehiculos();
    this.vehiculos.set(prev.filter((v) => v.id !== id));
    return prev;
  }

  /** Restaura un estado anterior (rollback ante fallo de red). */
  restore(list: Vehiculo[]): void {
    this.vehiculos.set(list);
  }

  /** Recarga un único vehículo desde el backend (ej: tras editar imágenes). */
  refreshOne(id: string): void {
    this.service.getById(id).subscribe({
      next: (v) => this.replace(v),
      error: () => {},
    });
  }

  private message(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar al servidor. Verifica que el backend esté disponible.';
    }
    if (err.status === 401) {
      return 'Tu sesión expiró. Por favor inicia sesión de nuevo.';
    }
    return `Error ${err.status}: ${err.error?.error ?? 'No se pudo cargar la colección.'}`;
  }
}
