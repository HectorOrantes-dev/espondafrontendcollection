import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'coleccion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/collection/collection.component').then(
        (m) => m.CollectionComponent,
      ),
  },
  {
    path: 'etiquetas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/etiquetas/etiquetas.component').then(
        (m) => m.EtiquetasComponent,
      ),
  },
  {
    path: 'agregar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/add-car/add-car.component').then(
        (m) => m.AddCarComponent,
      ),
  },
  {
    path: 'coleccion/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/add-car/add-car.component').then(
        (m) => m.AddCarComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
