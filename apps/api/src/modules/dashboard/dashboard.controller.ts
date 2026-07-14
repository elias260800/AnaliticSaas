import { Controller, Get, Query, Sse, UseGuards, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { KpiFiltersDto } from './dto/kpi-filters.dto';
import { JwtPayload, KpisResponse, ChartResponse } from '@analitic-saas/shared';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @RequirePermissions('dashboard:read')
  async getKpis(
    @Query() filters: KpiFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<KpisResponse> {
    return this.dashboardService.getKpis(user.tenantId, filters);
  }

  @Get('charts/revenue')
  @RequirePermissions('dashboard:read')
  async getRevenueChart(
    @Query() filters: KpiFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ChartResponse> {
    return this.dashboardService.getRevenueChart(user.tenantId, filters);
  }

  @Sse('stream')
  @RequirePermissions('dashboard:read')
  streamMetrics(@CurrentUser() user: JwtPayload): Observable<MessageEvent> {
    return this.dashboardService.getMetricsStream(user.tenantId);
  }
}
