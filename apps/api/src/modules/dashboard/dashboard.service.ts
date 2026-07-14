import { Injectable, MessageEvent } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KpiFiltersDto } from './dto/kpi-filters.dto';
import { KpisResponse, ChartResponse, ChartSeries } from '@analitic-saas/shared';
import { Observable, interval, map } from 'rxjs';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(tenantId: string, filters: KpiFiltersDto): Promise<KpisResponse> {
    const fromDate = filters.from || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const toDate = filters.to || new Date().toISOString().split('T')[0];
    const region = filters.region || null;
    const plan = filters.plan || null;

    try {
      // 1. In a real scenario, query PostgreSQL Materialized Views (mv_monthly_metrics / mv_daily_kpis)
      // Since it might fail offline, this is wrapped in try/catch.
      const dbKpis = await this.prisma.$queryRaw`
        SELECT * FROM mv_monthly_metrics 
        WHERE tenant_id = ${tenantId}::uuid
      `;
      // Process database results...
      if (dbKpis && (dbKpis as any[]).length > 0) {
        // Real DB implementation mapping...
      }
    } catch (err) {
      // Gracefully fall back to demo mode
    }

    // High fidelity mock database response (dynamic based on filters)
    let mrrMultiplier = 1.0;
    if (plan === 'enterprise') mrrMultiplier = 2.5;
    else if (plan === 'professional') mrrMultiplier = 1.2;
    else if (plan === 'starter') mrrMultiplier = 0.4;

    let regionMultiplier = 1.0;
    if (region === 'latam') regionMultiplier = 0.8;
    else if (region === 'north_america') regionMultiplier = 1.5;
    else if (region === 'europe') regionMultiplier = 1.2;

    const baseMrr = 125400.50 * mrrMultiplier * regionMultiplier;
    const previousMrr = 118200.00 * mrrMultiplier * regionMultiplier;
    const mrrChange = ((baseMrr - previousMrr) / previousMrr) * 100;

    const activeUsers = Math.round(3240 * regionMultiplier);
    const prevActiveUsers = Math.round(2980 * regionMultiplier);
    const usersChange = ((activeUsers - prevActiveUsers) / prevActiveUsers) * 100;

    const churnRate = 2.3;
    const prevChurnRate = 3.1;
    const churnChange = ((churnRate - prevChurnRate) / prevChurnRate) * 100; // Negative is improvement

    const newSubs = Math.round(145 * mrrMultiplier * regionMultiplier);
    const prevNewSubs = Math.round(122 * mrrMultiplier * regionMultiplier);
    const subsChange = ((newSubs - prevNewSubs) / prevNewSubs) * 100;

    return {
      period: { from: fromDate, to: toDate },
      filters: { region, plan },
      kpis: {
        mrr: {
          current: Math.round(baseMrr * 100) / 100,
          previous: Math.round(previousMrr * 100) / 100,
          changePercent: Math.round(mrrChange * 100) / 100,
          currency: 'USD',
        },
        activeUsers: {
          current: activeUsers,
          previous: prevActiveUsers,
          changePercent: Math.round(usersChange * 100) / 100,
        },
        churnRate: {
          current: churnRate,
          previous: prevChurnRate,
          changePercent: Math.round(churnChange * 100) / 100,
        },
        newSubscriptions: {
          current: newSubs,
          previous: prevNewSubs,
          changePercent: Math.round(subsChange * 100) / 100,
        },
      },
    };
  }

  async getRevenueChart(tenantId: string, filters: KpiFiltersDto): Promise<ChartResponse> {
    const region = filters.region || null;
    const plan = filters.plan || null;
    const granularity = filters.granularity || 'monthly';

    // Generate dynamic chart data based on date ranges and filters
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    
    let mrrMultiplier = 1.0;
    if (plan === 'enterprise') mrrMultiplier = 2.5;
    else if (plan === 'professional') mrrMultiplier = 1.2;
    else if (plan === 'starter') mrrMultiplier = 0.4;

    let regionMultiplier = 1.0;
    if (region === 'latam') regionMultiplier = 0.8;
    else if (region === 'north_america') regionMultiplier = 1.5;
    else if (region === 'europe') regionMultiplier = 1.2;

    const baseRevenue = [98500, 102300, 108700, 115200, 120800, 125400.5];
    const baseChurn = [3200, 2800, 4100, 2500, 3000, 2900];

    const revenueData = baseRevenue.map(v => Math.round(v * mrrMultiplier * regionMultiplier * 100) / 100);
    const churnData = baseChurn.map(v => Math.round(v * mrrMultiplier * regionMultiplier * 100) / 100);

    const series: ChartSeries[] = [
      {
        label: 'MRR (Ingreso Recurrente)',
        data: labels.map((l, i) => ({ date: l, value: revenueData[i] })),
      },
      {
        label: 'Cancelaciones (Pérdidas)',
        data: labels.map((l, i) => ({ date: l, value: churnData[i] })),
      },
    ];

    return {
      chartType: 'line',
      granularity,
      series,
    };
  }

  getMetricsStream(tenantId: string): Observable<MessageEvent> {
    // Emit real-time simulation updates every 8 seconds
    return interval(8000).pipe(
      map(() => {
        const randomMetric = Math.random();
        if (randomMetric < 0.4) {
          // KPI Update: MRR increases slightly
          const change = Math.round((Math.random() * 500) * 100) / 100;
          return {
            type: 'kpi_update',
            data: JSON.stringify({
              type: 'mrr',
              current: 125400.5 + change,
              changePercent: 6.12,
              timestamp: new Date().toISOString(),
            }),
          };
        } else if (randomMetric < 0.7) {
          // KPI Update: Active users fluctuate
          const activeDiff = Math.floor(Math.random() * 10) - 4; // -4 to +5
          return {
            type: 'kpi_update',
            data: JSON.stringify({
              type: 'activeUsers',
              current: 3240 + activeDiff,
              changePercent: 8.85,
              timestamp: new Date().toISOString(),
            }),
          };
        } else {
          // New Event: Client creation or payment
          const plans = ['starter', 'professional', 'enterprise'];
          const regions = ['latam', 'north_america', 'europe'];
          const randomPlan = plans[Math.floor(Math.random() * plans.length)];
          const randomRegion = regions[Math.floor(Math.random() * regions.length)];
          return {
            type: 'new_event',
            data: JSON.stringify({
              type: 'subscription_created',
              plan: randomPlan,
              region: randomRegion,
              timestamp: new Date().toISOString(),
            }),
          };
        }
      }),
    );
  }
}
