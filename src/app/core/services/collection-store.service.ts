import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColeccionService } from './coleccion.service';
import { Vehiculo } from '../models/vehiculo.model';

/**
 * Estado compartido de la colección.
 *
 * - `serverList`: lo confirmado por el backend.
 * - `pending`: altas optimistas en vuelo (aún sin confirmar). Se pintan encima
 *   y SOBREVIVEN a las recargas de fondo, para que un alta no desaparezca
 *   mientras su subida (POST con imágenes) termina.
 *
 * `vehiculos` es la mezcla de ambas, fuente única para grid, carrusel y filtro.
 */
@Injectable({ providedIn: 'root' })
export class CollectionStore {
  private service = inject(ColeccionService);

  private serverList = signal<Vehiculo[]>([]);
  private pending = signal<Vehiculo[]>([]);

  readonly loading = signal(false);
  readonly error = signal('');
  private loaded = false;

  readonly vehiculos = computed(() => [...this.pending(), ...this.serverList()]);

  load(): void {
    // Solo spinner la primera vez; luego refresca en segundo plano.
    const first = !this.loaded;
    if (first) this.loading.set(true);
    this.error.set('');
    this.service.list().subscribe({
      next: (data) => {
        this.serverList.set(data);
        this.loaded = true;
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (first) this.error.set(this.message(err));
        this.loading.set(false);
      },
    });
  }

  getById(id: string): Vehiculo | undefined {
    return this.vehiculos().find((v) => v.id === id);
  }

  // ── Alta optimista ──

  /** Pinta un vehículo al instante (antes de confirmar el POST). */
  addPending(v: Vehiculo): void {
    this.pending.update((list) => [v, ...list]);
  }

  /** El POST se confirmó: trae la lista real y retira el optimista. */
  confirmCreate(tempId: string): void {
    this.service.list().subscribe({
      next: (data) => {
        this.serverList.set(data);
        this.pending.update((list) => list.filter((v) => v.id !== tempId));
        this.loaded = true;
      },
      // Si el refresh falla, dejamos el optimista para no perder la card.
      error: () => {},
    });
  }

  /** El POST falló: retira el optimista. */
  cancelPending(tempId: string): void {
    this.pending.update((list) => list.filter((v) => v.id !== tempId));
  }

  // ── Edición / borrado (sobre la lista confirmada) ──

  replace(v: Vehiculo): void {
    this.serverList.update((list) =>
      list.map((item) => (item.id === v.id ? v : item)),
    );
  }

  patch(id: string, changes: Partial<Vehiculo>): void {
    this.serverList.update((list) =>
      list.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  /** Quita un vehículo y devuelve el estado anterior para poder revertir. */
  remove(id: string): Vehiculo[] {
    const prev = this.serverList();
    this.serverList.set(prev.filter((v) => v.id !== id));
    this.pending.update((list) => list.filter((v) => v.id !== id));
    return prev;
  }

  /** Restaura un estado anterior (rollback ante fallo de red). */
  restore(list: Vehiculo[]): void {
    this.serverList.set(list);
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
