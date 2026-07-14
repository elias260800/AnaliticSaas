import { Component, inject, effect, viewChild, ElementRef, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardStore } from './store/dashboard.store';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { KpiFilters } from '@analitic-saas/shared';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, FilterBarComponent],
  providers: [DashboardStore],
  template: `
    <div class="space-y-6">
      <!-- Title & Live Event Notification Banner -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-white">Dashboard de Métricas</h1>
          <p class="text-sm text-slate-400 mt-2">Monitorea los ingresos de tu organización y métricas clave en tiempo real.</p>
        </div>
        
        <!-- Live Notifications Banner -->
        @if (liveNotification()) {
          <div class="bg-indigo-500/10 border border-indigo-500/25 px-4 py-2.5 rounded-xl flex items-center space-x-2 animate-bounce">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span class="text-xs font-semibold text-indigo-300">
              ⚡ {{ liveNotification() }}
            </span>
          </div>
        }
      </div>

      <!-- Filter Bar -->
      <app-filter-bar
        [filters]="store.filters()"
        (filtersChanged)="onFiltersChanged($event)"
      />

      <!-- Error Alert -->
      @if (store.error()) {
        <div class="bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl">
          {{ store.error() }}
        </div>
      }

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        @if (store.isLoading()) {
          @for (skeleton of [1, 2, 3, 4]; track skeleton) {
            <div class="h-32 bg-slate-900/20 border border-slate-900 animate-pulse rounded-2xl"></div>
          }
        } @else {
          <app-kpi-card
            title="MRR (Ingresos)"
            [value]="store.mrrFormatted()"
            [change]="store.kpis().mrr?.changePercent ?? 0"
            icon="trending_up"
          />
          <app-kpi-card
            title="Usuarios Activos"
            [value]="(store.kpis().activeUsers?.current ?? 0).toLocaleString()"
            [change]="store.kpis().activeUsers?.changePercent ?? 0"
            icon="people"
          />
          <app-kpi-card
            title="Tasa de Cancelación"
            [value]="(store.kpis().churnRate?.current ?? 0) + '%'"
            [change]="store.kpis().churnRate?.changePercent ?? 0"
            [invertColor]="true"
            icon="cancel"
          />
          <app-kpi-card
            title="Nuevas Suscripciones"
            [value]="(store.kpis().newSubscriptions?.current ?? 0).toLocaleString()"
            [change]="store.kpis().newSubscriptions?.changePercent ?? 0"
            icon="add_circle"
          />
        }
      </div>

      <!-- Charts & Revenue Evolution Card -->
      <div class="grid grid-cols-1 gap-6">
        <div class="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div class="mb-4">
            <h3 class="text-lg font-bold text-slate-100">Evolución de Ingresos y Cancelaciones</h3>
            <p class="text-xs text-slate-400 mt-1">Comparativa de ingresos recurrentes y pérdidas de suscripciones en el periodo seleccionado.</p>
          </div>
          
          <div class="relative h-[320px] w-full">
            <canvas #revenueChart></canvas>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnDestroy {
  readonly store = inject(DashboardStore);

  private revenueCanvas = viewChild<ElementRef>('revenueChart');
  private chart: Chart | undefined;
  private eventSource: EventSource | null = null;

  // Local signal for active notification toast
  liveNotification = signal<string | null>(null);
  private notificationTimeout: any;

  constructor() {
    // 1. Initial metrics load
    this.store.loadDashboardData();

    // 2. React to filters changes: reload stats automatically
    effect(() => {
      const _filters = this.store.filters(); // register reactive dependency
      this.store.loadDashboardData();
    });

    // 3. React to datasets updates: redraw Chart.js canvas reactively
    effect(() => {
      const labels = this.store.revenueChartLabels();
      const datasets = this.store.revenueChartDatasets();
      const canvasRef = this.revenueCanvas();

      if (!canvasRef || labels.length === 0) return;

      if (this.chart) {
        // Update data in existing chart instance to keep hover animations smooth
        this.chart.data.labels = labels;
        this.chart.data.datasets = datasets.map((ds, i) => ({
          ...this.chart!.data.datasets[i],
          label: ds.label,
          data: ds.data,
        }));
        this.chart.update('none'); // silent update (no full scale redraw)
      } else {
        // Initialize chart instance on first load
        this.chart = new Chart(canvasRef.nativeElement, {
          type: 'line',
          data: {
            labels,
            datasets: datasets.map((ds, i) => ({
              label: ds.label,
              data: ds.data,
              borderColor: i === 0 ? '#a855f7' : '#f43f5e', // purple-500 vs rose-500
              backgroundColor: i === 0 ? 'rgba(168, 85, 247, 0.05)' : 'rgba(244, 63, 94, 0.05)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: i === 0 ? '#a855f7' : '#f43f5e',
              pointHoverRadius: 6,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#94a3b8', // slate-400
                  font: { family: 'ui-sans-serif, system-ui, sans-serif', size: 11 },
                },
              },
              tooltip: {
                padding: 12,
                backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900 with opacity
                borderColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                callbacks: {
                  label: (context) => ` ${context.dataset.label}: $${Number(context.parsed.y).toLocaleString()}`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 10 } }, // slate-500
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.02)' },
                ticks: {
                  color: '#64748b',
                  font: { size: 10 },
                  callback: (value) => `$${Number(value).toLocaleString()}`,
                },
              },
            },
          },
        });
      }
    });

    // 4. Initialize real-time updates stream using SSE
    this.initRealtimeStream();
  }

  onFiltersChanged(newFilters: Partial<KpiFilters>) {
    this.store.updateFilters(newFilters);
  }

  private initRealtimeStream() {
    if (typeof window === 'undefined') return;

    this.eventSource = new EventSource('http://localhost:3000/api/dashboard/stream');

    // KPI live updates
    this.eventSource.addEventListener('kpi_update', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      this.store.handleRealtimeKpiUpdate(data);
    });

    // Client creation / subscription events
    this.eventSource.addEventListener('new_event', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'subscription_created') {
        this.showNotification(`Nueva Suscripción! Plan ${data.plan.toUpperCase()} registrado en ${data.region.toUpperCase()}`);
      }
    });

    this.eventSource.onerror = (err) => {
      console.warn('⚠️ Real-time stream SSE disconnected. Retrying...');
    };
  }

  private showNotification(message: string) {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.liveNotification.set(message);
    this.notificationTimeout = setTimeout(() => {
      this.liveNotification.set(null);
    }, 4500); // Hide notification after 4.5s
  }

  ngOnDestroy() {
    this.chart?.destroy();
    this.eventSource?.close();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }
}
export default DashboardComponent;
