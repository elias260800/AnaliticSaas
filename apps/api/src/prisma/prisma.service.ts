import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static createPrismaOptions() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:SecurePassword123@localhost:5432/analitic_saas?schema=public';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return { adapter };
  }

  constructor() {
    super(PrismaService.createPrismaOptions());
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.warn('⚠️ Could not connect to the database. Running in offline/disconnected mode.', err.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
