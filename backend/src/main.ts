import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';

async function bootstrap() {
  console.log('JWT_SECRET in main:', process.env.JWT_SECRET);
  const app = await NestFactory.create(AppModule);

  // Configure session middleware
  app.use(
    session({
      secret: 'nexavelosai-secret-key', // Should use process.env.SESSION_SECRET
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 }, // 1 hour
    }),
  );

  // Global validation pipe with sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
      transform: true, // Transform payloads to DTO instances
      disableErrorMessages: false, // Show detailed error messages in production (consider security)
    }),
  );

  // Enable Helmet with appropriate CSP configuration for widget embedding
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for widget inline scripts
            "'unsafe-eval'", // Required for some widget functionality
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Required for widget inline styles
          ],
          imgSrc: ["'self'", 'data:', 'https:'],
          frameSrc: ["'self'", 'https:'],
          connectSrc: ["'self'", 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow embedding from external domains
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
    }),
  );

  app.enableCors({
    origin: true, // Allow all origins for widget embedding

    credentials: true,

    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization', // Explicitly allow these headers
  });

  // Enable Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NexaVelosAI API')
    .setDescription('API documentation for NexaVelosAI')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
