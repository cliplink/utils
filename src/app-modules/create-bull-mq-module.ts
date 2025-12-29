import { SharedBullAsyncConfiguration } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { QueueOptions } from 'bullmq';

export function createBullMqModule<T>(configKey: keyof T): SharedBullAsyncConfiguration {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService): QueueOptions => {
      const redisConfig = configService.getOrThrow(configKey as string) as {
        host: string;
        port: number;
      };
      return {
        connection: {
          host: redisConfig.host,
          port: redisConfig.port,
        },
      };
    },
  };
}
