import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../core/auth/store/auth.store';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Title -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Usuarios del Sistema</h1>
        <p class="text-sm text-slate-400 mt-2">Administra los accesos, roles y permisos de los miembros de tu organización.</p>
      </div>

      <!-- Users Table -->
      <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-950/50">
                <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Nombre Completo</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Correo Electrónico</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Rol Principal</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Estado</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Último Acceso</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (user of mockUsers; track user.id) {
                <tr class="hover:bg-slate-900/20 transition-colors">
                  <td class="px-6 py-4 flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/15 flex items-center justify-center text-purple-400 font-bold text-xs">
                      {{ user.firstName[0] }}{{ user.lastName[0] }}
                    </div>
                    <div>
                      <div class="font-bold text-white text-sm">{{ user.firstName }} {{ user.lastName }}</div>
                      @if (user.id === authStore.user()?.id) {
                        <span class="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-md font-semibold border border-purple-500/15">Tú</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-300 text-xs font-mono">{{ user.email }}</td>
                  <td class="px-6 py-4">
                    <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-medium uppercase">
                      Activo
                    </span>
                  </td>
                  <td class="px-6 py-4 text-slate-400 text-xs">{{ user.lastLogin }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent {
  readonly authStore = inject(AuthStore);

  mockUsers = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firstName: 'Carlos',
      lastName: 'García',
      email: 'admin@empresa.com',
      role: 'Administrador (Global)',
      lastLogin: 'Hace unos instantes',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      firstName: 'María',
      lastName: 'López',
      email: 'maria@empresa.com',
      role: 'Gestor de Clientes',
      lastLogin: 'Ayer, 16:45',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      firstName: 'Jorge',
      lastName: 'Pérez',
      email: 'jorge@empresa.com',
      role: 'Analista de Datos',
      lastLogin: 'Hace 3 días',
    }
  ];
}
export default UsersComponent;
