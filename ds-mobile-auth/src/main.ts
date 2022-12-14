import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(
    new AllExceptionFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );
  app.setGlobalPrefix('auth/api/v1');
  app.use(compression());
  app.use(helmet());
  app.enable('trust proxy');

  //Swagger set up
  const options = new DocumentBuilder()
    .setTitle(`${process.env.APP_NAME}`)
    .setBasePath('auth/api/v1/')
    .setDescription(`${process.env.APP_NAME} api`)
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('auth/api/v1/docs', app, document);
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
