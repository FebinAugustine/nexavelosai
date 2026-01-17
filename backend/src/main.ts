import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('JWT_SECRET in main:', process.env.JWT_SECRET);
  const app = await NestFactory.create(AppModule);

  // Global validation pipe with sanitization
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
    transform: true, // Transform payloads to DTO instances
    disableErrorMessages: false, // Show detailed error messages in production (consider security)
  }));

  app.use(helmet());
  app.enableCors({
    origin: true, // Allow all origins for widget embedding
    credentials: true,
  });
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
