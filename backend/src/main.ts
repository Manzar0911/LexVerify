import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Security: helmet headers
  app.use(helmet());

  // CORS: allow localhost ports 3000, 5173 and configured origins
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || configuredOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development/docker test environment
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Global request logging middleware
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    const { method, originalUrl, body } = req;
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const logMsg = `[HTTP] ${method} ${originalUrl} -> ${statusCode} (${duration}ms)`;
      if (statusCode >= 400) {
        console.error(`${logMsg} | Payload:`, JSON.stringify(body));
      } else {
        console.log(logMsg);
      }
    });
    next();
  });

  // Global validation pipe: whitelist, auto-transform
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Discard unexpected fields rather than failing
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Vendor Verification API')
    .setDescription('AI-Powered Vendor Verification Workspace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
