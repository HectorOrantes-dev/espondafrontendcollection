import { Injectable, inject, signal } from '@angular/core';
import { EtiquetasService } from './etiquetas.service';
import { Etiqueta } from '../models/etiqueta.model';

/**
 * Estado compartido de las etiquetas. Lo consumen el formulario (para
 * asignarlas), la colección (para filtrar) y la página de gestión.
 */
@Injectable({ providedIn: 'root' })
export class EtiquetasStore {
  private service = inject(EtiquetasService);

  readonly etiquetas = signal<Etiqueta[]>([]);
  readonly loading = signal(false);
  private loaded = false;

  load(): void {
    // Solo spinner la primera vez; después refresca en segundo plano.
    const first = !this.loaded;
    if (first) this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => {
        this.etiquetas.set(data);
        this.loaded = true;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Fuerza una recarga (tras crear/editar/eliminar o asignar a vehículos). */
  reload(): void {
    this.load();
  }
}
