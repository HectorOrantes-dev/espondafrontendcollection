import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ColeccionService } from '../../core/services/coleccion.service';
import { CollectionStore } from '../../core/services/collection-store.service';
import { EtiquetasStore } from '../../core/services/etiquetas-store.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Vehiculo } from '../../core/models/vehiculo.model';

interface Lightbox {
  nombre: string;
  marca: string;
  imagenes: string[];
  index: number;
}

@Component({
  selector: 'app-collection',
  imports: [RouterLink, SlicePipe],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionComponent implements OnInit {
  private coleccionService = inject(ColeccionService);
  private store = inject(CollectionStore);
  private etiquetasStore = inject(EtiquetasStore);
  private confirmService = inject(ConfirmService);

  readonly etiquetas = this.etiquetasStore.etiquetas;

  // El estado vive en el store compartido
  readonly vehiculos = this.store.vehiculos;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly search = signal('');
  readonly tagFilter = signal('');
  // Resultados del filtro por etiqueta (los trae el backend). null = sin filtro.
  readonly tagResults = signal<Vehiculo[] | null>(null);
  readonly lightbox = signal<Lightbox | null>(null);
  readonly downloadingExcel = signal(false);
  readonly downloadingBackup = signal(false);
  readonly highlightId = signal<string | null>(null);
  private highlightTimer: ReturnType<typeof setTimeout> | undefined;

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    // Si hay etiqueta activa, la base son los resultados del backend
    const base = this.tagFilter() ? this.tagResults() ?? [] : this.vehiculos();
    if (!term) return base;
    return base.filter(
      (v) =>
        v.nombre.toLowerCase().includes(term) ||
        v.marca.toLowerCase().includes(term) ||
        v.modelo.toLowerCase().includes(term),
    );
  });

  ngOnInit(): void {
    this.store.load();
    this.etiquetasStore.load();
  }

  onTagFilter(event: Event): void {
    this.applyTagFilter((event.target as HTMLSelectElement).value);
  }

  private applyTagFilter(nombre: string): void {
    this.tagFilter.set(nombre);

    if (!nombre) {
      this.tagResults.set(null);
      return;
    }

    // El backend devuelve los vehículos que tienen esa etiqueta
    this.coleccionService.list(nombre).subscribe({
      next: (data) => this.tagResults.set(data),
      error: () => this.tagResults.set([]),
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  /** Desde el carrusel: localiza la tarjeta en la cuadrícula y la resalta. */
  scrollToVehicle(v: Vehiculo): void {
    // Si hay un filtro activo que ocultaría la tarjeta, se limpia
    if (this.search()) this.search.set('');

    // Espera un tick para que la cuadrícula refleje el filtro limpio
    setTimeout(() => {
      const el = document.getElementById(`card-${v.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightId.set(v.id);
      clearTimeout(this.highlightTimer);
      this.highlightTimer = setTimeout(() => this.highlightId.set(null), 2200);
    });
  }

  async deleteVehiculo(v: Vehiculo): Promise<void> {
    const ok = await this.confirmService.ask({
      title: '¿Eliminar vehículo?',
      message: `"${v.nombre}" se quitará permanentemente de tu colección. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    // Optimista: se quita de inmediato; si falla, se restaura
    const prev = this.store.remove(v.id);
    this.coleccionService.delete(v.id).subscribe({
      next: () => {
        // Los conteos de etiquetas cambian al borrar un vehículo
        this.etiquetasStore.reload();
        // Si el filtro por etiqueta está activo, refresca sus resultados
        if (this.tagFilter()) this.applyTagFilter(this.tagFilter());
      },
      error: () => {
        this.store.restore(prev);
        this.confirmService.ask({
          title: 'Error al eliminar',
          message: 'No se pudo eliminar el vehículo. Se restauró en tu colección.',
          confirmText: 'Entendido',
          cancelText: 'Cerrar',
        });
      },
    });
  }

  // ── Descargas ──
  exportExcel(): void {
    if (this.downloadingExcel()) return;
    this.downloadingExcel.set(true);
    this.coleccionService
      .exportExcel()
      // finalize corre en ÉXITO y en ERROR: el botón nunca queda bloqueado
      .pipe(finalize(() => this.downloadingExcel.set(false)))
      .subscribe({
        next: (blob) => this.saveBlob(blob, 'coleccion.xlsx'),
        error: () => this.notifyDownloadError('No se pudo generar el Excel.'),
      });
  }

  exportBackup(): void {
    if (this.downloadingBackup()) return;
    this.downloadingBackup.set(true);
    this.coleccionService
      .exportBackup()
      .pipe(finalize(() => this.downloadingBackup.set(false)))
      .subscribe({
        next: (blob) => this.saveBlob(blob, 'respaldo_coleccion.zip'),
        error: () =>
          this.notifyDownloadError('No se pudo generar el respaldo.'),
      });
  }

  private notifyDownloadError(message: string): void {
    this.confirmService.ask({
      title: 'Error al descargar',
      message: `${message} Intenta de nuevo.`,
      confirmText: 'Entendido',
      cancelText: 'Cerrar',
      danger: true,
    });
  }

  /** Fuerza la descarga de un blob en el navegador. */
  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    // Revoca después de un tick: en archivos grandes, revocar de inmediato
    // puede cancelar la descarga antes de que el navegador la capture.
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  // ── Visor de imágenes (lightbox) ──
  openLightbox(v: Vehiculo): void {
    if (!v.imagenes || v.imagenes.length === 0) return;
    this.lightbox.set({
      nombre: v.nombre,
      marca: v.marca,
      imagenes: v.imagenes,
      index: 0,
    });
  }

  closeLightbox(): void {
    this.lightbox.set(null);
  }

  goToImage(index: number): void {
    this.lightbox.update((lb) => (lb ? { ...lb, index } : lb));
  }

  nextImage(): void {
    this.lightbox.update((lb) =>
      lb ? { ...lb, index: (lb.index + 1) % lb.imagenes.length } : lb,
    );
  }

  prevImage(): void {
    this.lightbox.update((lb) =>
      lb
        ? { ...lb, index: (lb.index - 1 + lb.imagenes.length) % lb.imagenes.length }
        : lb,
    );
  }

  trackById(_: number, v: Vehiculo): string {
    return v.id;
  }

  onImageError(event: Event): void {
    // Oculta la imagen rota para que se vea el placeholder de fondo
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
