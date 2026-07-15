import { IsNotEmpty, IsString, IsEmail, IsArray, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsOptional()
  lastName?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
