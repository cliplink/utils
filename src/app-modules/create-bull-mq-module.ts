import {SharedBullAsyncConfiguration} from '@nestjs/bullmq';
import {ConfigModule, ConfigService} from '@nestjs/config';
import type {QueueOptions} from 'bullmq';

export function createBullMqModule<T extends Record<string, any>>(
  configKey: keyof T,
): SharedBullAsyncConfiguration {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService<T>): QueueOptions => {
      const redisConfig = configService.getOrThrow(configKey as string);
      return {
        connection: {
          host: redisConfig.host,
          port: redisConfig.port,
        },
      };
    },
  };
}
