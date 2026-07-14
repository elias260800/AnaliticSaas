import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientsService } from '../../services/clients.service';
import { AuthStore } from '../../../../core/auth/store/auth.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-white">Clientes Corporativos</h1>
          <p class="text-sm text-slate-400 mt-2">Gestiona el catálogo de clientes corporativos, contactos y límites de plan.</p>
        </div>

        @if (authStore.hasPermission('clients:write')) {
          <a
            routerLink="/clients/new"
            class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 active:scale-[0.98] shadow-lg shadow-purple-500/10"
          >
            + Nuevo Cliente
          </a>
        }
      </div>

      <!-- Search & Filters -->
      <div class="backdrop-blur-xl bg-slate-900/30 border border-slate-900 px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
        <div class="w-full max-w-sm">
          <input
            type="text"
            placeholder="Buscar por nombre, ID fiscal o país..."
            (input)="onSearch($event)"
            class="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
          />
        </div>
        <div class="text-xs text-slate-500 font-medium">
          Total: {{ filteredClients().length }} cliente(s)
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <span class="inline-block animate-spin border-4 border-purple-500 border-t-transparent rounded-full w-8 h-8"></span>
          <span class="text-xs text-slate-400">Cargando catálogo de clientes...</span>
        </div>
      } @else {
        <!-- Empty State -->
        @if (filteredClients().length === 0) {
          <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800 p-12 rounded-2xl text-center space-y-4">
            <span class="inline-block text-4xl">👥</span>
            <h3 class="text-lg font-bold text-slate-200">No se encontraron clientes</h3>
            <p class="text-xs text-slate-500 max-w-xs mx-auto">
              Comienza registrando tu primer cliente corporativo pulsando el botón "Nuevo Cliente".
            </p>
          </div>
        } @else {
          <!-- Clients Table -->
          <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 bg-slate-950/50">
                    <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Nombre Legal</th>
                    <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">ID Fiscal</th>
                    <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">País</th>
                    <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Plan</th>
                    <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Usuarios</th>
                    <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Estado</th>
                    <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  @for (client of filteredClients(); track client.id) {
                    <tr class="hover:bg-slate-900/20 transition-colors">
                      <td class="px-6 py-4">
                        <div class="font-bold text-white text-sm">{{ client.legalName }}</div>
                        @if (client.tradeName) {
                          <div class="text-xs text-slate-500">{{ client.tradeName }}</div>
                        }
                      </td>
                      <td class="px-6 py-4 text-slate-300 text-xs font-mono">{{ client.taxId }}</td>
                      <td class="px-6 py-4 text-slate-400 text-xs">{{ client.country }}</td>
                      <td class="px-6 py-4">
                        <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase">
                          {{ client.planConfig?.planName || 'Free' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-slate-300 text-xs">
                        {{ client.planConfig?.userLimit || 0 }} max
                      </td>
                      <td class="px-6 py-4">
                        <span
                          [ngClass]="client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'"
                          class="text-[10px] px-2.5 py-0.5 rounded-full border font-medium uppercase"
                        >
                          {{ client.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        @if (authStore.hasPermission('clients:write')) {
                          <a
                            [routerLink]="['/clients', client.id, 'edit']"
                            class="text-xs text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 hover:bg-purple-500/5 rounded-lg transition-all"
                          >
                            Editar
                          </a>
                        }
                        @if (authStore.hasPermission('clients:delete')) {
                          <button
                            (click)="onDelete(client.id)"
                            class="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 hover:bg-rose-500/5 rounded-lg transition-all"
                          >
                            Eliminar
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class ClientListComponent implements OnInit {
  private clientsService = inject(ClientsService);
  readonly authStore = inject(AuthStore);

  clients = signal<any[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);

  // Computed signal to filter clients dynamically on the client-side
  filteredClients = signal<any[]>([]);

  constructor() {
    effect(() => {
      const all = this.clients();
      const q = this.searchQuery().toLowerCase().trim();
      
      if (!q) {
        this.filteredClients.set(all);
      } else {
        const filtered = all.filter(
          (c) =>
            c.legalName.toLowerCase().includes(q) ||
            (c.tradeName && c.tradeName.toLowerCase().includes(q)) ||
            c.taxId.toLowerCase().includes(q) ||
            c.country.toLowerCase().includes(q)
        );
        this.filteredClients.set(filtered);
      }
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  async loadClients() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.clientsService.getAll());
      this.clients.set(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  async onDelete(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente corporativo? Esta acción no se puede deshacer.')) {
      try {
        await firstValueFrom(this.clientsService.delete(id));
        this.clients.update((list) => list.filter((c) => c.id !== id));
      } catch (err) {
        console.error('Error deleting client:', err);
      }
    }
  }
}
export default ClientListComponent;
