import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EtiquetasService } from '../../core/services/etiquetas.service';
import { EtiquetasStore } from '../../core/services/etiquetas-store.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Etiqueta } from '../../core/models/etiqueta.model';

@Component({
  selector: 'app-etiquetas',
  imports: [ReactiveFormsModule],
  templateUrl: './etiquetas.component.html',
  styleUrl: './etiquetas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtiquetasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(EtiquetasService);
  private store = inject(EtiquetasStore);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);

  readonly etiquetas = this.store.etiquetas;
  readonly loading = this.store.loading;
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(40)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(40)]],
  });

  ngOnInit(): void {
    this.store.load();
  }

  crear(): void {
    if (this.form.invalid || this.saving()) return;
    const nombre = this.form.getRawValue().nombre.trim();
    if (!nombre) return;

    this.saving.set(true);
    this.service.create(nombre).subscribe({
      next: () => {
        this.form.reset();
        this.store.reload();
        this.saving.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving.set(false);
        this.notifyError('No se pudo crear la etiqueta.');
      },
    });
  }

  startEdit(et: Etiqueta): void {
    this.editingId.set(et.id);
    this.editForm.setValue({ nombre: et.nombre });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  guardarEdit(et: Etiqueta): void {
    if (this.editForm.invalid) return;
    const nombre = this.editForm.getRawValue().nombre.trim();
    if (!nombre) return;

    this.service.update(et.id, nombre).subscribe({
      next: () => {
        this.editingId.set(null);
        this.store.reload();
        this.cdr.markForCheck();
      },
      error: () => this.notifyError('No se pudo actualizar la etiqueta.'),
    });
  }

  async eliminar(et: Etiqueta): Promise<void> {
    const ok = await this.confirmService.ask({
      title: '¿Eliminar etiqueta?',
      message: `Se eliminará "${et.nombre}"${
        et.cantidad > 0
          ? ` y se quitará de los ${et.cantidad} vehículo(s) que la tienen`
          : ''
      }.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    this.service.delete(et.id).subscribe({
      next: () => this.store.reload(),
      error: () => this.notifyError('No se pudo eliminar la etiqueta.'),
    });
  }

  private notifyError(message: string): void {
    this.confirmService.ask({
      title: 'Ups',
      message,
      confirmText: 'Entendido',
      cancelText: 'Cerrar',
      danger: true,
    });
  }
}
