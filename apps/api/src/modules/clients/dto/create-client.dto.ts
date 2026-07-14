import { IsNotEmpty, IsString, IsEmail, IsArray, ValidateNested, IsOptional, IsInt, Min, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre legal es requerido' })
  legalName: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsString()
  @IsNotEmpty({ message: 'El ID fiscal es requerido' })
  taxId: string;

  @IsString()
  @IsNotEmpty({ message: 'El país es requerido' })
  country: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

export class BillingDto {
  @IsEmail({}, { message: 'El email de facturación debe ser válido' })
  @IsNotEmpty({ message: 'El email de facturación es requerido' })
  billingEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección de facturación es requerida' })
  billingAddress: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'El país es requerido' })
  country: string;

  @IsString()
  @IsNotEmpty({ message: 'La moneda es requerida' })
  currency: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class ContactDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'El rol es requerido' })
  role: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class PlanConfigDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del plan es requerido' })
  planName: string;

  @IsInt()
  @Min(1, { message: 'El límite de usuarios debe ser mayor a 0' })
  userLimit: number;

  @IsInt()
  @Min(1, { message: 'El almacenamiento debe ser mayor a 0' })
  storageLimitGb: number;

  @IsDateString({}, { message: 'La fecha de inicio debe ser válida' })
  startedAt: string;

  @IsBoolean()
  @IsOptional()
  isTrial?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  trialDays?: number;
}

export class CreateClientDto {
  @ValidateNested()
  @Type(() => CompanyDto)
  company: CompanyDto;

  @ValidateNested()
  @Type(() => BillingDto)
  billing: BillingDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];

  @ValidateNested()
  @Type(() => PlanConfigDto)
  planConfig: PlanConfigDto;
}
