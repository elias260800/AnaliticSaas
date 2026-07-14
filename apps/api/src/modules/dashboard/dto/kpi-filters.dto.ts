import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class KpiFiltersDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser válida' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser válida' })
  to?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'], { message: 'Granularidad inválida' })
  granularity?: 'daily' | 'weekly' | 'monthly';
}
