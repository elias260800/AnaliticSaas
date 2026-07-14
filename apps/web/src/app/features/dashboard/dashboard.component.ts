import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../core/auth/store/auth.store';

@Component({
  selector: 'app-dashboard-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Title -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Dashboard Principal</h1>
        <p class="text-sm text-slate-400 mt-2">Bienvenido, {{ authStore.userFullName() }}. Aquí verás el resumen de tu organización.</p>
      </div>

      <!-- Welcome Info Panel -->
      <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800 p-8 rounded-2xl relative overflow-hidden shadow-xl">
        <div class="absolute w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-[80px] -right-20 -top-20 pointer-events-none"></div>

        <h2 class="text-xl font-bold text-slate-100 mb-4 flex items-center space-x-2">
          <span>🚀 Fase 1 Completada: Autenticación & RBAC</span>
        </h2>
        
        <p class="text-slate-300 text-sm leading-relaxed mb-6">
          Has iniciado sesión correctamente. Este módulo valida tus permisos en el cliente (Route Guards) y en el servidor (NestJS Guards) utilizando JWTs con firmas criptográficas.
        </p>

        <!-- Current User Metadata Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-slate-950/60 border border-slate-900 p-4 rounded-xl">
            <span class="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Tu Organización (Tenant ID)</span>
            <p class="text-xs font-mono text-purple-400 mt-1 truncate">{{ authStore.user()?.tenantId }}</p>
          </div>
          <div class="bg-slate-950/60 border border-slate-900 p-4 rounded-xl">
            <span class="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Roles Asignados</span>
            <div class="flex flex-wrap gap-1 mt-1.5">
              @for (role of authStore.user()?.roles; track role) {
                <span class="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {{ role }}
                </span>
              }
            </div>
          </div>
          <div class="bg-slate-950/60 border border-slate-900 p-4 rounded-xl">
            <span class="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Plan de Suscripción</span>
            <p class="text-xs font-semibold text-indigo-400 mt-1 capitalize">{{ authStore.currentTenantPlan() }}</p>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-900">
          <span class="text-xs text-slate-500">
            Los siguientes módulos de Gráficos y CRM estarán disponibles en las siguientes fases del plan de desarrollo.
          </span>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  readonly authStore = inject(AuthStore);
}
export default DashboardComponent;
