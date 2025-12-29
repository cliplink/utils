import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import {SharedBullAsyncConfiguration} from "@nestjs/bullmq";

export function createTypeOrmModule<T extends Record<string, any>>(
  configKey: keyof T,
  options?: SharedBullAsyncConfiguration,
): TypeOrmModuleAsyncOptions {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService<T>) => {
      const opts = configService.getOrThrow<TypeOrmModuleOptions>(configKey as string);

      if (!opts) throw new Error('Database config is missing');

      return {
        autoLoadEntities: true,
        ...opts,
        ...options,
      };
    },
  }
}
