import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../apps/api/src/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

const server = express();

let isAppInitialized = false;
let app: any = null;

async function createServer() {
  if (isAppInitialized) {
    return server;
  }

  app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();
  isAppInitialized = true;
  return server;
}

// Export serverless handler
export default async (req: any, res: any) => {
  const initializedServer = await createServer();
  return initializedServer(req, res);
};
