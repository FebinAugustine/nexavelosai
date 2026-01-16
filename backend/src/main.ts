import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('JWT_SECRET in main:', process.env.JWT_SECRET);
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin: true, // Allow all origins for widget embedding
    credentials: true,
  });
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
