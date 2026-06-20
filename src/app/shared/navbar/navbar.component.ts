import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar">
      <div class="navbar__inner">
        <a routerLink="/" class="navbar__brand">

          <span class="navbar__name">ESPONDA CARS COLLECTION</span>
        </a>

        <ul class="navbar__links">
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
              Inicio
            </a>
          </li>
          @if (auth.isAuthenticated()) {
            <li>
              <a routerLink="/coleccion" routerLinkActive="active">Mi Colección</a>
            </li>
            <li>
              <a routerLink="/etiquetas" routerLinkActive="active">Etiquetas</a>
            </li>
          }
        </ul>

        <div class="navbar__actions">
          @if (auth.isAuthenticated()) {
            <a routerLink="/agregar" class="btn btn--primary">+ Agregar Auto</a>
            <button class="btn btn--ghost" (click)="auth.logout()">Salir</button>
          } @else {
            <a routerLink="/login" class="btn btn--primary">Iniciar sesión</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #0f172a;
      border-bottom: 1px solid rgba(255 255 255 / 0.08);
    }

    .navbar__inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      flex-shrink: 0;
    }

    .navbar__logo {
      display: inline-flex;
      width: 24px;
      height: 24px;
    }

    .navbar__name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
    }

    .navbar__links {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.25rem;
      flex: 1;
    }

    .navbar__links a {
      display: block;
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.15s, background 0.15s;
    }

    .navbar__links a:hover { color: #fff; background: rgba(255 255 255 / 0.06); }
    .navbar__links a.active { color: #fff; background: rgba(255 255 255 / 0.1); }

    .navbar__actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn--primary {
      background: #dc2626;
      color: #fff;
    }

    .btn--primary:hover { background: #b91c1c; }

    .btn--ghost {
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(255 255 255 / 0.12);
    }

    .btn--ghost:hover { color: #fff; border-color: rgba(255 255 255 / 0.3); }
  `,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
}
