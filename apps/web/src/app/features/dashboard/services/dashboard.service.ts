import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KpiFilters, KpisResponse, ChartResponse } from '@analitic-saas/shared';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = '/api/dashboard';

  getKpis(filters: KpiFilters): Observable<KpisResponse> {
    const params = this.buildParams(filters);
    return this.http.get<KpisResponse>(`${this.apiUrl}/kpis`, { params });
  }

  getRevenueChart(filters: KpiFilters): Observable<ChartResponse> {
    const params = this.buildParams(filters);
    return this.http.get<ChartResponse>(`${this.apiUrl}/charts/revenue`, { params });
  }

  private buildParams(filters: KpiFilters): HttpParams {
    let params = new HttpParams();
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.region) params = params.set('region', filters.region);
    if (filters.plan) params = params.set('plan', filters.plan);
    if (filters.granularity) params = params.set('granularity', filters.granularity);
    return params;
  }
}
