import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmOptions | null>(null);
  private resolver: ((value: boolean) => void) | null = null;

  ask(options: ConfirmOptions): Promise<boolean> {
    this.state.set({
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      danger: false,
      ...options,
    });
    return new Promise<boolean>((resolve) => (this.resolver = resolve));
  }

  confirm(): void {
    this.resolver?.(true);
    this.close();
  }

  cancel(): void {
    this.resolver?.(false);
    this.close();
  }

  private close(): void {
    this.state.set(null);
    this.resolver = null;
  }
}
