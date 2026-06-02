import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  app.enableCors({
    origin: [
      'http://localhost:8000',
      'http://localhost:8081',
      'https://impulseguard.app',
      'http://localhost:3000',
    ],
  });

  app.use(
    '/auth/webhooks',
    bodyParser.raw({
      type: '*/*',
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  await app.listen(4000);
}

bootstrap();
