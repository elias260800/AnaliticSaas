import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { KpiFilters, KpiItem, ChartSeries, SseKpiUpdatePayload } from '@analitic-saas/shared';
import { firstValueFrom } from 'rxjs';

interface DashboardState {
  kpis: {
    mrr: KpiItem | null;
    activeUsers: KpiItem | null;
    churnRate: KpiItem | null;
    newSubscriptions: KpiItem | null;
  };
  revenueSeries: ChartSeries[];
  filters: KpiFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  kpis: {
    mrr: null,
    activeUsers: null,
    churnRate: null,
    newSubscriptions: null,
  },
  revenueSeries: [],
  filters: {
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    region: null,
    plan: null,
    granularity: 'monthly',
  },
  isLoading: false,
  error: null,
};

export const DashboardStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    mrrFormatted: computed(() => {
      const mrr = store.kpis().mrr;
      if (!mrr) return '$0.00';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: mrr.currency || 'USD',
      }).format(mrr.current);
    }),

    revenueChartLabels: computed(() => {
      const series = store.revenueSeries();
      return series[0]?.data.map((d) => d.date) ?? [];
    }),

    revenueChartDatasets: computed(() => {
      const series = store.revenueSeries();
      return series.map((s) => ({
        label: s.label,
        data: s.data.map((d) => d.value),
      }));
    }),
  })),

  withMethods((store, dashboardService = inject(DashboardService)) => ({
    async loadDashboardData(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const filters = store.filters();
        const [kpiRes, chartRes] = await Promise.all([
          firstValueFrom(dashboardService.getKpis(filters)),
          firstValueFrom(dashboardService.getRevenueChart(filters)),
        ]);

        patchState(store, {
          kpis: kpiRes.kpis,
          revenueSeries: chartRes.series,
          isLoading: false,
        });
      } catch (err: any) {
        patchState(store, {
          isLoading: false,
          error: err.error?.message ?? 'Error cargando datos del dashboard',
        });
      }
    },

    updateFilters(partialFilters: Partial<KpiFilters>): void {
      patchState(store, {
        filters: { ...store.filters(), ...partialFilters },
      });
    },

    handleRealtimeKpiUpdate(payload: SseKpiUpdatePayload): void {
      patchState(store, (state) => {
        const currentKpis = { ...state.kpis };
        const key = payload.type as keyof typeof currentKpis;
        
        if (currentKpis[key]) {
          currentKpis[key] = {
            ...currentKpis[key]!,
            current: payload.current,
            changePercent: payload.changePercent,
          };
        }

        return { kpis: currentKpis };
      });
    },
  }))
);
export type DashboardStore = InstanceType<typeof DashboardStore>;
