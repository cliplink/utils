// test/bullmq-factory.spec.ts
import {ConfigService} from '@nestjs/config';
import {createBullMqModule} from './create-bull-mq-module';
import type {QueueOptions} from 'bullmq';

interface TestConfig {
  redis: {
    host: string;
    port: number;
  };
}

describe('createBullMqModule', () => {
  it('should return SharedBullAsyncConfiguration with correct connection options', async () => {
    const configKey: keyof TestConfig = 'redis';
    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue({host: '127.0.0.1', port: 6379}),
    } as unknown as ConfigService<TestConfig>;

    const bullConfig = createBullMqModule<TestConfig>(configKey);

    if (!bullConfig.useFactory) {
      throw new Error('useFactory is not defined');
    }
    const queueOptions: QueueOptions = await bullConfig.useFactory(mockConfigService);

    expect(queueOptions).toEqual({
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    });

    // Проверяем, что getOrThrow вызван с правильным ключом
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('redis');
  });

  it('should throw if config service does not return expected object', async () => {
    const configKey: keyof TestConfig = 'redis';
    const mockConfigService = {
      getOrThrow: jest.fn().mockImplementation(() => {
        throw new Error('Not found');
      }),
    } as unknown as ConfigService<TestConfig>;

    const bullConfig = createBullMqModule<TestConfig>(configKey);

    const useFactory = bullConfig.useFactory!;

    expect(() => useFactory(mockConfigService)).toThrow('Not found');
  });
});