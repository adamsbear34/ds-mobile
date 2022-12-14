import { Module } from '@nestjs/common';
import { CardModule } from './card/card.module';
import { AuthModule } from './auth/auth.module';
import { PayModule } from './pay/pay.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { Card } from './card/model/card.model';
import { VCardOper } from './common/models/v-card-oper.model';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EquipmentModule } from './equipment/equipment.module';
import { HttpModule } from '@nestjs/axios';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        sid: configService.get('DB_SID'),
        synchronize: false,
        entities: [Card, VCardOper],
      }),
      inject: [ConfigService],
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
        transports: [
          new LogtailTransport(new Logtail(configService.get('LOGTAIL_TOKEN'))),
        ],
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('TTL'),
        limit: config.get<number>('LIMIT'),
      }),
    }),
    CardModule,
    AuthModule,
    PayModule,
    EquipmentModule,
    HttpModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
