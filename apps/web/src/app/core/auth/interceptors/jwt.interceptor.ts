import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);

  const token = authStore.accessToken();

  // Skip adding token for login and refresh endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Intercept 401 Unauthorized errors for automatic refresh
      if (error.status === 401) {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (refreshToken) {
          return authService.refresh(refreshToken).pipe(
            switchMap((response) => {
              authStore.setTokens(response.accessToken, response.refreshToken);
              // Retry original request with new token
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${response.accessToken}` },
              });
              return next(retryReq);
            }),
            catchError((refreshErr) => {
              authStore.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
          authStore.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
