import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../../../libs/shared/src';

@Controller('clients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermissions('clients:read')
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.clientsService.findAll(user.tenantId);
  }

  @Get('check-tax-id')
  @RequirePermissions('clients:read')
  async checkTaxId(
    @Query('taxId') taxId: string,
    @Query('excludeClientId') excludeClientId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.checkTaxId(user.tenantId, taxId, excludeClientId);
  }

  @Get('check-domain')
  @RequirePermissions('clients:read')
  async checkDomain(
    @Query('domain') domain: string,
    @Query('excludeClientId') excludeClientId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.checkDomain(user.tenantId, domain, excludeClientId);
  }

  @Get(':id')
  @RequirePermissions('clients:read')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientsService.findOne(id, user.tenantId);
  }

  @Post()
  @RequirePermissions('clients:write')
  async create(@Body() dto: CreateClientDto, @CurrentUser() user: JwtPayload) {
    return this.clientsService.create(user.tenantId, dto);
  }

  @Put(':id')
  @RequirePermissions('clients:write')
  async update(
    @Param('id') id: string,
    @Body() dto: CreateClientDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @RequirePermissions('clients:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientsService.remove(id, user.tenantId);
  }
}
