import { AppModule } from './app';
import { AppLaunchConfig } from './app/configs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Should specify before the swagger document builder
  app.enableVersioning({
    type: VersioningType.URI,
  });
  const launchConfig = app.get(AppLaunchConfig);


  const config = new DocumentBuilder()
    .setTitle('Test task API Documentation')
    .setDescription('API documentation for Test task Bot API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  app.useGlobalPipes(new ValidationPipe());

  await app.listen(launchConfig.appPort);
}

bootstrap().then();
