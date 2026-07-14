import { Route } from '@angular/router';
import { authGuard, permissionGuard } from './core/auth/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [permissionGuard],
        data: { permissions: ['dashboard:read'] },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'clients',
        canActivate: [permissionGuard],
        data: { permissions: ['clients:read'] },
        loadChildren: () =>
          import('./features/clients/clients.routes').then(
            (m) => m.CLIENTS_ROUTES
          ),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permissions: ['users:read'] },
        loadComponent: () =>
          import('./features/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'billing',
        canActivate: [permissionGuard],
        data: { permissions: ['billing:read'] },
        loadComponent: () =>
          import('./features/billing/billing.component').then(
            (m) => m.BillingComponent
          ),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: { permissions: ['settings:read'] },
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
