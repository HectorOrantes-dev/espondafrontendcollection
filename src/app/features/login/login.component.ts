import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-card__header">
          <span class="login-card__icon">🏎</span>
          <h1>ESPONDA CAR COLLECTION</h1>
          <p>Inicia sesión en tu colección</p>
        </div>

        @if (error()) {
          <div class="alert alert--error" role="alert">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="field">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="tu@correo.com"
              autocomplete="email"
              [class.field__input--error]="submitted() && form.controls.email.invalid"
            />
            @if (submitted() && form.controls.email.invalid) {
              <span class="field__error">Ingresa un correo válido</span>
            }
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <div class="field__password-wrap">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
                [class.field__input--error]="submitted() && form.controls.password.invalid"
              />
              <button
                type="button"
                class="field__eye"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                @if (showPassword()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
            @if (submitted() && form.controls.password.invalid) {
              <span class="field__error">La contraseña es requerida</span>
            }
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner" aria-hidden="true"></span>
              Iniciando sesión…
            } @else {
              Iniciar sesión
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .login-page {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: #ffffff;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
    }

    .login-card__header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-card__icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.75rem;
      color: #ff4d4d;
    }

    .login-card__header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #ff1a1a;
      font-family: 'Racing Sans One', cursive;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      text-shadow: 0 2px 12px rgba(255, 26, 26, 0.25);
      margin: 0 0 0.35rem;
    }

    .login-card__header p {
      color: #475569;
      margin: 0;
      font-size: 0.95rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(220, 38, 38, 0.25);
      color: #fee2e2;
    }

    .alert--error {
      background: rgba(220, 38, 38, 0.14);
      color: #fecaca;
      border-color: rgba(220, 38, 38, 0.4);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
    }

    .field label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
    }

    .field input {
      padding: 0.75rem 0.95rem;
      border: 1.5px solid rgba(15, 23, 42, 0.12);
      background: #f8fafc;
      border-radius: 12px;
      font-size: 0.95rem;
      color: #0f172a;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
      outline: none;
    }

    .field input::placeholder {
      color: rgba(248, 250, 252, 0.6);
    }

    .field input:focus {
      border-color: #ff1a1a;
      box-shadow: 0 0 0 3px rgba(255, 26, 26, 0.18);
      background: rgba(255, 255, 255, 0.08);
    }

    .field__input--error { border-color: #fca5a5 !important; }

    .field__password-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field__password-wrap input {
      width: 100%;
      padding-right: 2.75rem;
    }

    .field__eye {
      position: absolute;
      right: 0.7rem;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      cursor: pointer;
      color: #cbd5e1;
      padding: 0.35rem;
      display: flex;
      align-items: center;
      border-radius: 8px;
      transition: color 0.15s, background 0.15s;
    }

    .field__eye:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    .field__error {
      font-size: 0.8rem;
      color: #fca5a5;
    }

    .btn-submit {
      width: 100%;
      padding: 0.85rem;
      background: linear-gradient(135deg, #ff1a1a 0%, #ff4a4a 100%);
      color: #ffffff;
      border: none;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: transform 0.15s, background 0.15s, box-shadow 0.15s;
      margin-top: 0.5rem;
      box-shadow: 0 10px 30px rgba(255, 26, 26, 0.22);
    }

    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #ff3838 0%, #ff6868 100%);
      transform: translateY(-1px);
      box-shadow: 0 14px 34px rgba(255, 26, 26, 0.28);
    }

    .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgb(255 255 255 / 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly submitted = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/coleccion']),
      error: (err) => {
        if (err.status === 429) {
          const msg: string = err.error?.error ?? '';
          this.error.set(msg || 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.');
        } else if (err.status === 401 || err.status === 400) {
          const left: number | undefined = err.error?.attempts_left;
          this.error.set(
            left !== undefined
              ? `Correo o contraseña incorrectos. Te quedan ${left} intento(s).`
              : 'Correo o contraseña incorrectos.',
          );
        } else if (err.status === 0) {
          this.error.set('No se pudo conectar al servidor. Verifica que el backend esté disponible.');
        } else {
          this.error.set('Error inesperado. Intenta de nuevo.');
        }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }
}
