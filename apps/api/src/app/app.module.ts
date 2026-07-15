import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { ClientsModule } from '../modules/clients/clients.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, DashboardModule, ClientsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
