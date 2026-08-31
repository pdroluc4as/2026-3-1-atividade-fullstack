import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js'; //

async function bootstrap() {
  const app = await NestFactory.create(AppModule); 

  app.useGlobalPipes( 
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
    }),
  );

  // Configuração pra rodar no github codespace
  app.enableCors({
    origin: [
      'http://localhost:3000',
      /\.github\.dev$/, 
    ],
    credentials: true, 
  });

  
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0'); 
}
await bootstrap(); 