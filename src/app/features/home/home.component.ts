import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home">
      <!-- Hero -->
      <section class="hero">
        <div class="hero__inner">
          <div class="hero__badge">Tu Garaje Digital</div>
          <h1>Organiza y exhibe tu colección de vehículos a escala</h1>
          <p>Registra, cataloga y presume cada modelo con fotografías, datos de edición y más.</p>
          <div class="hero__actions">
            @if (auth.isAuthenticated()) {
              <a routerLink="/agregar" class="btn btn--primary">+ Agregar Vehículo</a>
              <a routerLink="/coleccion" class="btn btn--outline">Ver mi colección</a>
            } @else {
              <a routerLink="/login" class="btn btn--primary">Comenzar ahora</a>
            }
          </div>
        </div>
        <div class="hero__art" aria-hidden="true">
          <div class="hero__art-circle hero__art-circle--1"></div>
          <div class="hero__art-circle hero__art-circle--2"></div>
          <svg class="hero__car" viewBox="0 0 300 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="60" width="260" height="50" rx="12" fill="rgba(255,255,255,0.07)"/>
            <rect x="55" y="35" width="155" height="40" rx="10" fill="rgba(255,255,255,0.1)"/>
            <rect x="70" y="40" width="60" height="28" rx="5" fill="rgba(255,255,255,0.08)"/>
            <rect x="145" y="40" width="55" height="28" rx="5" fill="rgba(255,255,255,0.08)"/>
            <circle cx="72" cy="112" r="20" fill="rgba(255,255,255,0.08)"/>
            <circle cx="72" cy="112" r="12" fill="rgba(255,255,255,0.1)"/>
            <circle cx="228" cy="112" r="20" fill="rgba(255,255,255,0.08)"/>
            <circle cx="228" cy="112" r="12" fill="rgba(255,255,255,0.1)"/>
            <rect x="20" y="95" width="260" height="4" rx="2" fill="rgba(220,38,38,0.5)"/>
          </svg>
        </div>
      </section>

      <!-- Features -->
      <section class="features">
        <div class="features__inner">
          <div class="feature-card">
            <div class="feature-card__icon">📸</div>
            <h3>Fotos en Drive</h3>
            <p>Tus imágenes se almacenan en Google Drive, siempre accesibles y sin límite.</p>
          </div>
          <div class="feature-card">
            <div class="feature-card__icon">🏷️</div>
            <h3>Cataloga por marca</h3>
            <p>Clasifica cada modelo por marca, nombre y línea para encontrarlo al instante.</p>
          </div>
          <div class="feature-card">
            <div class="feature-card__icon">📱</div>
            <h3>Acceso desde cualquier lugar</h3>
            <p>Tu colección disponible en cualquier dispositivo, cuando quieras.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: `
    .home { background: #f8fafc; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%);
      padding: 5rem 1.5rem 4rem;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      min-height: 420px;
    }

    .hero__inner {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      position: relative;
      z-index: 1;
      max-width: 560px;
    }

    .hero__badge {
      display: inline-block;
      padding: 0.3rem 0.85rem;
      background: rgba(220 38 38 / 0.2);
      border: 1px solid rgba(220 38 38 / 0.4);
      border-radius: 999px;
      color: #fca5a5;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      margin-bottom: 1.25rem;
    }

    .hero__inner h1 {
      font-size: clamp(1.75rem, 4vw, 2.75rem);
      font-weight: 800;
      color: #fff;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin: 0 0 1rem;
    }

    .hero__inner p {
      color: #94a3b8;
      font-size: 1.05rem;
      line-height: 1.65;
      margin: 0 0 2rem;
      max-width: 440px;
    }

    .hero__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.7rem 1.5rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s;
    }

    .btn--primary {
      background: #dc2626;
      color: #fff;
      box-shadow: 0 4px 12px rgb(220 38 38 / 0.35);
    }

    .btn--primary:hover { background: #b91c1c; transform: translateY(-1px); }

    .btn--outline {
      background: transparent;
      color: #fff;
      border: 1.5px solid rgba(255 255 255 / 0.25);
    }

    .btn--outline:hover { border-color: rgba(255 255 255 / 0.5); background: rgba(255 255 255 / 0.05); }

    /* Hero art */
    .hero__art {
      position: absolute;
      right: 5%;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.7;
    }

    .hero__art-circle {
      position: absolute;
      border-radius: 50%;
    }

    .hero__art-circle--1 {
      width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(220 38 38 / 0.15) 0%, transparent 70%);
      top: -80px; right: -40px;
    }

    .hero__art-circle--2 {
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(59 130 246 / 0.1) 0%, transparent 70%);
      bottom: -40px; right: 40px;
    }

    .hero__car { width: 300px; }

    /* Features */
    .features { padding: 4rem 1.5rem; }

    .features__inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }

    .feature-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.04);
      transition: box-shadow 0.2s, transform 0.2s;
    }

    .feature-card:hover {
      box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);
      transform: translateY(-2px);
    }

    .feature-card__icon {
      font-size: 2rem;
      margin-bottom: 0.85rem;
      display: block;
    }

    .feature-card h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .feature-card p {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 768px) {
      .hero__art { display: none; }
    }
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
