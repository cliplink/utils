import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

export function createTypeOrmModule<T>(
  configKey: keyof T,
  options?: Partial<TypeOrmModuleOptions>,
): TypeOrmModuleAsyncOptions {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const opts = configService.getOrThrow<TypeOrmModuleOptions>(configKey as string);

      if (!opts) throw new Error('Database config is missing');

      return {
        autoLoadEntities: true,
        ...opts,
        ...options,
      } as TypeOrmModuleOptions;
    },
  };
}
