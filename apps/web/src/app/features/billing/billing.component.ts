import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../core/auth/store/auth.store';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Title -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Facturación y Planes</h1>
        <p class="text-sm text-slate-400 mt-2">Controla tu suscripción activa, cuotas de uso de la organización y descarga tus facturas.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Plan Info Card -->
        <div class="md:col-span-2 backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-100">Suscripción Activa</h3>
            <span class="bg-purple-500/10 text-purple-400 border border-purple-500/25 text-xs px-3 py-1 rounded-full font-semibold uppercase">
              Plan {{ authStore.currentTenantPlan().toUpperCase() }}
            </span>
          </div>

          <p class="text-xs text-slate-400">
            Tu organización **{{ authStore.user()?.tenant?.name }}** está en el plan Premium. Tu próximo pago recurrente de **$499.00 USD** se procesará el **01 de Agosto de 2026**.
          </p>

          <div class="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <span class="text-xs text-slate-500">Método de Pago: Visa terminada en 4242</span>
            <button class="text-xs text-purple-400 hover:text-purple-300 font-semibold focus:outline-none">Cambiar Tarjeta</button>
          </div>
        </div>

        <!-- Usage Quota Card -->
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Límites de Uso</h3>
            
            <!-- Users quota -->
            <div class="space-y-1 mb-4">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-400">Usuarios del Sistema</span>
                <span class="text-slate-200">3 / 500</span>
              </div>
              <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500 rounded-full" style="width: 0.6%"></div>
              </div>
            </div>

            <!-- Storage quota -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-400">Almacenamiento (GB)</span>
                <span class="text-slate-200">12.4 GB / 500 GB</span>
              </div>
              <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 rounded-full" style="width: 2.5%"></div>
              </div>
            </div>
          </div>
          
          <p class="text-[10px] text-slate-500 mt-4">Las cuotas se recalculan diariamente a medianoche.</p>
        </div>
      </div>

      <!-- Invoices Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-slate-200">Historial de Facturas</h3>
        
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/50">
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">ID Factura</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Fecha de Emisión</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Importe</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Estado</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Descargar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-xs">
                @for (inv of mockInvoices; track inv.id) {
                  <tr class="hover:bg-slate-900/20 transition-colors">
                    <td class="px-6 py-4 text-slate-300 font-mono">{{ inv.id }}</td>
                    <td class="px-6 py-4 text-slate-400">{{ inv.date }}</td>
                    <td class="px-6 py-4 text-white font-semibold">{{ inv.amount }}</td>
                    <td class="px-6 py-4">
                      <span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium uppercase text-[10px]">
                        Pagado
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button class="text-purple-400 hover:text-purple-300 font-semibold focus:outline-none">📄 PDF</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BillingComponent {
  readonly authStore = inject(AuthStore);

  mockInvoices = [
    { id: 'INV-2026-004', date: '01 Jul 2026', amount: '$499.00 USD' },
    { id: 'INV-2026-003', date: '01 Jun 2026', amount: '$499.00 USD' },
    { id: 'INV-2026-002', date: '01 May 2026', amount: '$499.00 USD' },
    { id: 'INV-2026-001', date: '01 Apr 2026', amount: '$499.00 USD' }
  ];
}
export default BillingComponent;
