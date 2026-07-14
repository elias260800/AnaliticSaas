import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AuthUser } from '@analitic-saas/shared';
import { firstValueFrom } from 'rxjs';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
};

const getSafeItem = (key: string): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
};

const setSafeItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeSafeItem = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.accessToken()),
    userFullName: computed(() => {
      const user = store.user();
      return user ? `${user.firstName} ${user.lastName}` : '';
    }),
    userPermissions: computed(() => store.user()?.permissions ?? []),
    currentTenantPlan: computed(() => store.user()?.tenant?.plan ?? 'free'),
  })),

  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    async login(email: string, password: string, tenantSlug: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const response = await firstValueFrom(
          authService.login({ email, password, tenantSlug })
        );
        
        patchState(store, {
          user: response.user,
          accessToken: response.accessToken,
          isLoading: false,
        });

        setSafeItem('accessToken', response.accessToken);
        setSafeItem('refreshToken', response.refreshToken);
        
        router.navigate(['/dashboard']);
      } catch (err: any) {
        patchState(store, {
          isLoading: false,
          error: err.error?.message ?? 'Credenciales incorrectas o error de servidor',
        });
      }
    },

    hasPermission(permissionKey: string): boolean {
      const perms = store.user()?.permissions ?? [];
      return perms.includes(permissionKey);
    },

    hasAnyPermission(...permissionKeys: string[]): boolean {
      const userPerms = store.user()?.permissions ?? [];
      return permissionKeys.some((p) => userPerms.includes(p));
    },

    logout(): void {
      patchState(store, initialState);
      removeSafeItem('accessToken');
      removeSafeItem('refreshToken');
      router.navigate(['/login']);
    },

    setTokens(accessToken: string, refreshToken: string): void {
      patchState(store, { accessToken });
      setSafeItem('accessToken', accessToken);
      setSafeItem('refreshToken', refreshToken);
    },

    async loadCurrentUser(): Promise<void> {
      const token = getSafeItem('accessToken');
      if (!token) return;

      patchState(store, { accessToken: token, isLoading: true });
      try {
        const user = await firstValueFrom(authService.getMe());
        patchState(store, { user, isLoading: false });
      } catch (err) {
        // Token might be expired, clear it
        patchState(store, { user: null, accessToken: null, isLoading: false });
        removeSafeItem('accessToken');
        removeSafeItem('refreshToken');
      }
    }
  }))
);
export type AuthStore = InstanceType<typeof AuthStore>;
