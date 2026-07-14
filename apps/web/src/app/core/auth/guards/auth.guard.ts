import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';

/**
 * Route guard checking if the user is authenticated.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // If store doesn't have token but localStorage has, try to reload user
  if (!authStore.isAuthenticated()) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      await authStore.loadCurrentUser();
    }
  }

  if (authStore.isAuthenticated()) {
    return true;
  }

  // Redirect to login page and store the return url
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Route guard checking if the user has specific resource:action permissions.
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const hasAccess = requiredPermissions.every((perm) =>
    authStore.hasPermission(perm)
  );

  if (hasAccess) {
    return true;
  }

  // Redirect to unauthorized page
  return router.createUrlTree(['/unauthorized']);
};
