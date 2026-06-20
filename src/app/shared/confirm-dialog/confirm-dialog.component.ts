import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (confirm.state(); as opts) {
      <div
        class="overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        (click)="confirm.cancel()"
      >
        <div class="dialog" (click)="$event.stopPropagation()">
          <div
            class="dialog__icon"
            [class.dialog__icon--danger]="opts.danger"
            aria-hidden="true"
          >
            @if (opts.danger) {
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            } @else {
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            }
          </div>

          <h2 id="confirm-title" class="dialog__title">{{ opts.title }}</h2>
          <p class="dialog__message">{{ opts.message }}</p>

          <div class="dialog__actions">
            <button type="button" class="btn btn--cancel" (click)="confirm.cancel()">
              {{ opts.cancelText }}
            </button>
            <button
              type="button"
              class="btn"
              [class.btn--danger]="opts.danger"
              [class.btn--confirm]="!opts.danger"
              (click)="confirm.confirm()"
            >
              {{ opts.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgb(15 23 42 / 0.55);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fade 0.15s ease;
    }

    .dialog {
      background: #fff;
      border-radius: 18px;
      padding: 2rem 1.75rem 1.5rem;
      width: 100%;
      max-width: 380px;
      text-align: center;
      box-shadow: 0 20px 60px -10px rgb(0 0 0 / 0.35);
      animation: pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .dialog__icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 1.1rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eff6ff;
      color: #2563eb;
    }

    .dialog__icon--danger {
      background: #fef2f2;
      color: #dc2626;
    }

    .dialog__title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .dialog__message {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.55;
      margin: 0 0 1.5rem;
    }

    .dialog__actions {
      display: flex;
      gap: 0.65rem;
    }

    .btn {
      flex: 1;
      padding: 0.7rem 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }

    .btn--cancel {
      background: #f1f5f9;
      color: #475569;
      border: 1.5px solid #e2e8f0;
    }

    .btn--cancel:hover { background: #e2e8f0; }

    .btn--confirm {
      background: #2563eb;
      color: #fff;
      box-shadow: 0 4px 12px rgb(37 99 235 / 0.3);
    }

    .btn--confirm:hover { background: #1d4ed8; }

    .btn--danger {
      background: #dc2626;
      color: #fff;
      box-shadow: 0 4px 12px rgb(220 38 38 / 0.3);
    }

    .btn--danger:hover { background: #b91c1c; }

    @keyframes fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pop {
      from { opacity: 0; transform: scale(0.92) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `,
})
export class ConfirmDialogComponent {
  readonly confirm = inject(ConfirmService);
}
