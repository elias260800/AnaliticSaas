import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty({ message: 'El token de actualización es requerido' })
  refreshToken: string;
}
