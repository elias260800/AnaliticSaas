import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/guards/auth.guard';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permissions: ['clients:read'] },
    loadComponent: () =>
      import('./components/client-list/client-list.component').then(
        (m) => m.ClientListComponent
      ),
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permissions: ['clients:write'] },
    loadComponent: () =>
      import('./components/client-form/client-form.component').then(
        (m) => m.ClientFormComponent
      ),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard],
    data: { permissions: ['clients:write'] },
    loadComponent: () =>
      import('./components/client-form/client-form.component').then(
        (m) => m.ClientFormComponent
      ),
  },
];
export default CLIENTS_ROUTES;
