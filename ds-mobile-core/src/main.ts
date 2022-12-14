import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(
    new AllExceptionFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );
  app.setGlobalPrefix('core/api/v1');
  app.use(compression());
  app.use(helmet());
  app.enable('trust proxy');

  await app.listen(process.env.APP_PORT || 5000);
}
bootstrap();
