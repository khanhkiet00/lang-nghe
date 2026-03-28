import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  console.log('Backend running on http://localhost:3001/api/v1');
}
bootstrap();
