import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthStore } from '../../../core/auth/store/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center relative bg-slate-950 overflow-hidden px-4">
      <!-- Glow effects -->
      <div class="absolute w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div class="absolute w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[100px] top-1/4 left-1/4 pointer-events-none"></div>

      <div class="w-full max-w-md backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative z-10">
        <!-- Logo / Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xl shadow-lg shadow-purple-500/20 mb-3">
            AG
          </div>
          <h2 class="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Bienvenido a AnaliticSaas
          </h2>
          <p class="text-slate-400 text-sm mt-2">Ingresa tus credenciales para acceder</p>
        </div>

        <!-- Alert Error -->
        @if (authStore.error()) {
          <div class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg mb-6 flex items-start space-x-2">
            <span class="font-semibold">Error:</span>
            <span>{{ authStore.error() }}</span>
          </div>
        }

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Tenant Slug -->
          <div>
            <label for="tenantSlug" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Organización / Empresa *
            </label>
            <div class="relative">
              <input
                id="tenantSlug"
                type="text"
                formControlName="tenantSlug"
                placeholder="ej. acme-corp"
                class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 transition-all outline-none"
              />
            </div>
            @if (showError('tenantSlug')) {
              <p class="text-red-400 text-xs mt-1.5">El slug de la organización es requerido</p>
            }
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Correo Electrónico *
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="correo@ejemplo.com"
              class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 transition-all outline-none"
            />
            @if (showError('email')) {
              <p class="text-red-400 text-xs mt-1.5">Ingresa un correo electrónico válido</p>
            }
          </div>

          <!-- Password -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="password" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Contraseña *
              </label>
            </div>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 transition-all outline-none"
            />
            @if (showError('password')) {
              <p class="text-red-400 text-xs mt-1.5">La contraseña debe tener al menos 6 caracteres</p>
            }
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || authStore.isLoading()"
            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-900/50 disabled:to-indigo-900/50 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 active:scale-[0.98]"
          >
            @if (authStore.isLoading()) {
              <span class="inline-block animate-spin border-2 border-slate-300 border-t-transparent rounded-full w-4 h-4 mr-2 vertical-middle"></span>
              Autenticando...
            } @else {
              Iniciar Sesión
            }
          </button>

          <!-- Guest Login Button -->
          <button
            type="button"
            (click)="loginAsGuest()"
            [disabled]="authStore.isLoading()"
            class="w-full mt-3 bg-transparent border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5 text-purple-400 font-semibold rounded-xl py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 active:scale-[0.98]"
          >
            🔑 Acceder como Invitado (Demo)
          </button>
        </form>

        <!-- Help Info -->
        <div class="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p class="text-slate-500 text-xs">
            Credenciales Demo:<br/>
            <code class="text-purple-400">acme-corp</code> | 
            <code class="text-purple-400">admin@empresa.com</code> | 
            <code class="text-purple-400">SecureP@ss123</code>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  loginForm: FormGroup = this.fb.group({
    tenantSlug: ['acme-corp', [Validators.required]],
    email: ['admin@empresa.com', [Validators.required, Validators.email]],
    password: ['SecureP@ss123', [Validators.required, Validators.minLength(6)]],
  });

  loginAsGuest() {
    this.loginForm.patchValue({
      tenantSlug: 'acme-corp',
      email: 'admin@empresa.com',
      password: 'SecureP@ss123',
    });
    this.onSubmit();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password, tenantSlug } = this.loginForm.value;
      this.authStore.login(email, password, tenantSlug);
    }
  }

  showError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
export default LoginComponent;
