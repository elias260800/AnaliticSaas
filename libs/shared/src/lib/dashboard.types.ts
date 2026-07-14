export interface KpiFilters {
  from?: string;
  to?: string;
  region?: string | null;
  plan?: string | null;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export interface KpiItem {
  current: number;
  previous: number;
  changePercent: number;
  currency?: string;
}

export interface KpisResponse {
  period: { from: string; to: string };
  filters: { region: string | null; plan: string | null };
  kpis: {
    mrr: KpiItem;
    activeUsers: KpiItem;
    churnRate: KpiItem;
    newSubscriptions: KpiItem;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface ChartSeries {
  label: string;
  data: ChartDataPoint[];
}

export interface ChartResponse {
  chartType: string;
  granularity: string;
  series: ChartSeries[];
}

export interface SseKpiUpdatePayload {
  type: 'mrr' | 'activeUsers' | 'churnRate' | 'newSubscriptions';
  current: number;
  changePercent: number;
  timestamp: string;
}

export interface SseNewEventPayload {
  type: string;
  plan?: string;
  region?: string;
  timestamp: string;
}
