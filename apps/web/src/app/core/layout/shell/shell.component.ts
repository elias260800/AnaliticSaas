import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../auth/store/auth.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-950 flex">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-slate-900 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0">
        <div class="space-y-6">
          <!-- Org logo -->
          <div class="flex items-center space-x-3 px-2 py-3 border-b border-slate-900">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow shadow-purple-500/20">
              AS
            </div>
            <div>
              <h1 class="text-sm font-semibold text-slate-100 truncate w-40">
                {{ authStore.user()?.tenant?.name || 'Cargando...' }}
              </h1>
              <span class="text-[10px] text-purple-400 font-medium uppercase tracking-wider">
                Plan {{ authStore.currentTenantPlan() }}
              </span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="space-y-1">
            <!-- Dashboard -->
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-purple-600/10 text-purple-400 border-l-2 border-purple-500"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900/50 hover:text-slate-100 transition-all text-sm font-medium border-l-2 border-transparent"
            >
              <span>📊 Dashboard</span>
            </a>

            <!-- Clients (CRM) -->
            @if (authStore.hasPermission('clients:read')) {
              <a
                routerLink="/clients"
                routerLinkActive="bg-purple-600/10 text-purple-400 border-l-2 border-purple-500"
                class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900/50 hover:text-slate-100 transition-all text-sm font-medium border-l-2 border-transparent"
              >
                <span>👥 Clientes CRM</span>
              </a>
            }

            <!-- Users -->
            @if (authStore.hasPermission('users:read')) {
              <a
                routerLink="/users"
                routerLinkActive="bg-purple-600/10 text-purple-400 border-l-2 border-purple-500"
                class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900/50 hover:text-slate-100 transition-all text-sm font-medium border-l-2 border-transparent"
              >
                <span>⚙️ Usuarios</span>
              </a>
            }

            <!-- Billing -->
            @if (authStore.hasPermission('billing:read')) {
              <a
                routerLink="/billing"
                routerLinkActive="bg-purple-600/10 text-purple-400 border-l-2 border-purple-500"
                class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900/50 hover:text-slate-100 transition-all text-sm font-medium border-l-2 border-transparent"
              >
                <span>💳 Facturación</span>
              </a>
            }

            <!-- Settings -->
            @if (authStore.hasPermission('settings:read')) {
              <a
                routerLink="/settings"
                routerLinkActive="bg-purple-600/10 text-purple-400 border-l-2 border-purple-500"
                class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900/50 hover:text-slate-100 transition-all text-sm font-medium border-l-2 border-transparent"
              >
                <span>🛠 Configuración</span>
              </a>
            }
          </nav>
        </div>

        <!-- User section & Logout -->
        <div class="border-t border-slate-900 pt-4 space-y-4">
          <div class="flex items-center space-x-3 px-2">
            <div class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-sm">
              {{ authStore.user()?.firstName?.[0] || 'U' }}
            </div>
            <div class="min-w-0">
              <p class="text-xs font-medium text-slate-200 truncate">
                {{ authStore.userFullName() }}
              </p>
              <p class="text-[10px] text-slate-500 truncate">
                {{ authStore.user()?.email }}
              </p>
            </div>
          </div>
          <button
            (click)="authStore.logout()"
            class="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-950/40 text-xs font-semibold tracking-wide uppercase transition-all"
          >
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <!-- Top Header -->
        <header class="h-16 border-b border-slate-900 px-8 flex items-center justify-between shrink-0 bg-slate-950/20 backdrop-blur-xl">
          <h2 class="text-lg font-semibold text-slate-200">
            AnaliticSaas Dashboard
          </h2>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Servidor Conectado (Demo Mode)</span>
            </div>
          </div>
        </header>

        <!-- Dynamic router views -->
        <div class="flex-1 p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class ShellComponent {
  readonly authStore = inject(AuthStore);
}
export default ShellComponent;
