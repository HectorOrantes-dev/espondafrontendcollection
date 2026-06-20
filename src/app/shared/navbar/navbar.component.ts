import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar">
      <div class="navbar__inner">
        <a routerLink="/" class="navbar__brand" (click)="close()">
          <span class="navbar__name">ESPONDA CARS COLLECTION</span>
        </a>

        <!-- Botón hamburguesa (solo móvil) -->
        <button
          type="button"
          class="navbar__toggle"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Abrir menú"
        >
          @if (menuOpen()) {
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          } @else {
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          }
        </button>

        <!-- Menú: en línea en desktop, desplegable en móvil -->
        <div class="navbar__menu" [class.navbar__menu--open]="menuOpen()">
          <ul class="navbar__links">
            <li>
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="close()">
                Inicio
              </a>
            </li>
            @if (auth.isAuthenticated()) {
              <li>
                <a routerLink="/coleccion" routerLinkActive="active" (click)="close()">Mi Colección</a>
              </li>
              <li>
                <a routerLink="/etiquetas" routerLinkActive="active" (click)="close()">Etiquetas</a>
              </li>
            }
          </ul>

          <div class="navbar__actions">
            @if (auth.isAuthenticated()) {
              <a routerLink="/agregar" class="btn btn--primary" (click)="close()">+ Agregar Auto</a>
              <button class="btn btn--ghost" (click)="logout()">Salir</button>
            } @else {
              <a routerLink="/login" class="btn btn--primary" (click)="close()">Iniciar sesión</a>
            }
          </div>
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
      min-height: 64px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      flex-shrink: 1;
      min-width: 0;
    }

    .navbar__name {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Menú contenedor */
    .navbar__menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;
    }

    .navbar__links {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.25rem;
    }

    .navbar__links a {
      display: block;
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
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
      justify-content: center;
      gap: 0.35rem;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }

    .btn--primary { background: #dc2626; color: #fff; }
    .btn--primary:hover { background: #b91c1c; }

    .btn--ghost {
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(255 255 255 / 0.12);
    }

    .btn--ghost:hover { color: #fff; border-color: rgba(255 255 255 / 0.3); }

    /* Hamburguesa: oculta en desktop */
    .navbar__toggle {
      display: none;
      margin-left: auto;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 8px;
    }

    .navbar__toggle:hover { background: rgba(255 255 255 / 0.08); }

    /* ── Móvil ── */
    @media (max-width: 768px) {
      .navbar__name { font-size: 1rem; }

      .navbar__toggle { display: inline-flex; }

      .navbar__menu {
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        background: #0f172a;
        border-bottom: 1px solid rgba(255 255 255 / 0.08);
        padding: 1rem 1.5rem 1.5rem;
        box-shadow: 0 12px 24px rgb(0 0 0 / 0.3);
        /* Oculto por defecto */
        display: none;
      }

      .navbar__menu--open { display: flex; }

      .navbar__links {
        flex-direction: column;
        gap: 0.25rem;
      }

      .navbar__links a {
        padding: 0.7rem 0.85rem;
        font-size: 1rem;
      }

      .navbar__actions {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
        margin-left: 0;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(255 255 255 / 0.08);
      }

      .btn {
        width: 100%;
        padding: 0.7rem 1rem;
        font-size: 0.95rem;
      }
    }
  `,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);

  close(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.close();
    this.auth.logout();
  }
}
