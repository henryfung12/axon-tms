import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());

  // CORS — allow the main Vercel domain, all tenant subdomains of axon-tms.com,
  // and localhost for dev. The origin function lets us support an unbounded
  // number of tenant subdomains without listing each one.
  app.enableCors({
    origin: (origin, cb) => {
      // Server-to-server calls, curl, health checks — no Origin header.
      if (!origin) return cb(null, true);

      const ok =
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:3000' ||
        origin === 'https://axon-tms-web.vercel.app' ||
        origin === 'https://axon-tms.vercel.app' ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) ||      // preview deployments
        /^https:\/\/([a-z0-9-]+\.)?axon-tms\.com$/.test(origin);   // axon-tms.com and any subdomain

      return cb(null, ok);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Gemini Express TMS API')
      .setDescription('Transportation Management System REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`Swagger docs: http://localhost:${process.env.PORT || 3001}/api/docs`);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Gemini Express API running on: http://localhost:${port}/api/v1`);
}
bootstrap();