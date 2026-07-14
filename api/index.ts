import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api/src/app/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedHandler: any = null;

async function bootstrap() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await NestFactory.create(AppModule);
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
  
  // Get underlying Express instance created by NestJS internally
  cachedHandler = app.getHttpAdapter().getInstance();
  return cachedHandler;
}

export default async (req: any, res: any) => {
  const handler = await bootstrap();
  return handler(req, res);
};
