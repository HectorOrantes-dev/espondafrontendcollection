import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ColeccionService } from '../../core/services/coleccion.service';
import { CollectionStore } from '../../core/services/collection-store.service';
import { EtiquetasStore } from '../../core/services/etiquetas-store.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Vehiculo } from '../../core/models/vehiculo.model';
import { toPortraitImage } from '../../core/utils/image-orientation';

interface ImagePreview {
  url: string;
  name: string;
  file?: File; // ausente = imagen ya existente en el servidor
  existing?: boolean;
}

@Component({
  selector: 'app-add-car',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-car.component.html',
  styleUrl: './add-car.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class AddCarComponent {
  private fb = inject(FormBuilder);
  private coleccionService = inject(ColeccionService);
  private store = inject(CollectionStore);
  private etiquetasStore = inject(EtiquetasStore);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  readonly etiquetas = this.etiquetasStore.etiquetas;
  readonly selectedTags = signal<Set<string>>(new Set());

  // Enlazado desde el parámetro de ruta :id (withComponentInputBinding)
  readonly id = input<string>();
  readonly isEdit = computed(() => !!this.id());

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly serverError = signal('');
  readonly isDragging = signal(false);
  readonly submitted = signal(false);
  readonly previews = signal<ImagePreview[]>([]);
  // Marca si el usuario tocó algo (imágenes/etiquetas); el texto usa form.dirty
  readonly dirty = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.etiquetasStore.load();
    // Cuando hay id (modo edición), carga los datos del vehículo
    effect(() => {
      const vehiculoId = this.id();
      if (!vehiculoId) return;
      this.loadVehiculo(vehiculoId);
    });
  }

  toggleTag(id: string): void {
    this.selectedTags.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    this.dirty.set(true);
  }

  /** Hay datos sin guardar que se perderían al recargar/cerrar. */
  private hasUnsavedChanges(): boolean {
    return !this.success() && (this.dirty() || this.form.dirty);
  }

  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      // Requerido por navegadores antiguos para mostrar el diálogo nativo
      event.returnValue = '';
    }
  }

  isTagSelected(id: string): boolean {
    return this.selectedTags().has(id);
  }

  private loadVehiculo(id: string): void {
    this.coleccionService.getById(id).subscribe({
      next: (v) => {
        this.form.patchValue({
          nombre: v.nombre,
          marca: v.marca,
          modelo: v.modelo,
          precio: v.precio ?? 0,
        });
        this.previews.set(
          (v.imagenes ?? []).map((url, i) => ({
            url,
            name: `Imagen ${i + 1}`,
            existing: true,
          })),
        );
        this.selectedTags.set(new Set((v.etiquetas ?? []).map((e) => e.id)));
        this.cdr.markForCheck();
      },
      error: () => {
        this.serverError.set('No se pudo cargar el vehículo a editar.');
        this.cdr.markForCheck();
      },
    });
  }

  isInvalid(field: 'nombre' | 'marca' | 'modelo' | 'precio'): boolean {
    return this.submitted() && this.form.controls[field].invalid;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(Array.from(input.files));
    input.value = '';
    // Al volver de la app de cámara (móvil) el evento puede caer fuera del
    // ciclo normal de detección; forzamos el render del nuevo contador.
    this.cdr.markForCheck();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.previews().length < 3) this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (!event.dataTransfer?.files) return;
    this.addFiles(Array.from(event.dataTransfer.files));
  }

  removeImage(index: number): void {
    this.previews.update((list) => list.filter((_, i) => i !== index));
    this.dirty.set(true);
    this.cdr.markForCheck();
  }

  private async addFiles(files: File[]): Promise<void> {
    // Las fotos de cámara en algunos móviles llegan con type vacío; las
    // aceptamos igual (los inputs ya están limitados a accept="image/*").
    const imageFiles = files.filter(
      (f) => f.type === '' || f.type.startsWith('image/'),
    );

    const slots = 3 - this.previews().length;
    if (slots <= 0) return;

    // Procesa cada imagen a VERTICAL antes de agregarla; se añade en cuanto
    // está lista para que el contador reaccione una por una.
    for (const file of imageFiles.slice(0, slots)) {
      if (this.previews().length >= 3) break;
      const portrait = await toPortraitImage(file);
      this.previews.update((list) =>
        list.length < 3
          ? [
              ...list,
              {
                url: URL.createObjectURL(portrait),
                name: portrait.name || 'foto.jpg',
                file: portrait,
              },
            ]
          : list,
      );
      this.dirty.set(true);
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.serverError.set('');

    const { nombre, marca, modelo, precio } = this.form.getRawValue();
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('marca', marca);
    formData.append('modelo', modelo);
    formData.append('precio', String(precio ?? 0));

    // Solo se envían las imágenes nuevas (las que tienen File)
    for (const preview of this.previews()) {
      if (preview.file) {
        formData.append('imagenes', preview.file, preview.name);
      }
    }

    // Cada etiqueta seleccionada como campo repetido 'etiquetas' (por ID)
    for (const tagId of this.selectedTags()) {
      formData.append('etiquetas', tagId);
    }

    const id = this.id();
    if (id) {
      this.submitEdit(id, { nombre, marca, modelo, precio }, formData);
    } else {
      this.submitCreate(formData);
    }
  }

  /**
   * Edición optimista: actualiza el texto en el store al instante, navega de
   * vuelta a la colección sin esperar, y confirma/revierte en segundo plano.
   */
  private submitEdit(
    id: string,
    changes: { nombre: string; marca: string; modelo: string; precio: number },
    formData: FormData,
  ): void {
    const previous = this.store.getById(id);
    this.store.patch(id, changes);

    // La interfaz no espera: regresamos de inmediato
    this.router.navigate(['/coleccion']);

    this.coleccionService.update(id, formData).subscribe({
      next: () => {
        // Ya confirmado el PUT: refresca la lista completa en segundo plano
        // (es la fuente que trae las etiquetas embebidas e imágenes nuevas).
        this.store.load();
        this.etiquetasStore.reload();
      },
      error: (err: HttpErrorResponse) => {
        if (previous) this.store.replace(previous);
        this.notifyError(err, changes.nombre);
      },
    });
  }

  /**
   * Creación optimista total: pinta la card en la colección con las imágenes
   * locales y navega de inmediato. La subida (POST) corre en segundo plano y
   * solo al fallar se revierte y se avisa. La UX nunca espera al backend.
   */
  private submitCreate(formData: FormData): void {
    const { nombre, marca, modelo, precio } = this.form.getRawValue();
    const tagIds = this.selectedTags();

    // Vehículo optimista: imágenes locales (object URLs) y etiquetas elegidas
    const tempId = `temp-${Date.now()}`;
    const optimista: Vehiculo = {
      id: tempId,
      nombre,
      marca,
      modelo,
      precio: precio ?? 0,
      imagenes: this.previews().map((p) => p.url),
      etiquetas: this.etiquetas()
        .filter((e) => tagIds.has(e.id))
        .map((e) => ({ id: e.id, nombre: e.nombre })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.store.addPending(optimista);

    // Limpia y navega ya: la card aparece pintada sin esperar la subida
    this.dirty.set(false);
    this.form.reset();
    this.submitted.set(false);
    this.previews.set([]);
    this.selectedTags.set(new Set());
    this.router.navigate(['/coleccion']);

    this.coleccionService.create(formData).subscribe({
      next: () => {
        // Confirmado: reemplaza el optimista por los datos reales del backend
        this.store.confirmCreate(tempId);
        this.etiquetasStore.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.store.cancelPending(tempId);
        this.notifyError(err, nombre);
      },
    });
  }

  private notifyError(err: HttpErrorResponse, nombre: string): void {
    this.confirmService.ask({
      title: 'No se pudo guardar',
      message:
        err?.error?.error ??
        `Hubo un problema al guardar "${nombre}". Intenta de nuevo.`,
      confirmText: 'Entendido',
      cancelText: 'Cerrar',
      danger: true,
    });
  }
}
