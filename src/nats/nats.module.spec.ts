import { connect } from '@nats-io/transport-node';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { NATS_CONNECTION_SERVICE } from './constants';
import { NatsModule } from './nats.module';

jest.mock('@nats-io/transport-node', () => ({
  connect: jest.fn(),
}));

describe('NatsModule', () => {
  let module: TestingModule;
  let configService: ConfigService;
  let natsConnectionMock: {
    closed: jest.Mock;
  };
  let closedPromiseResolve: (value: unknown) => void;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'nats.server') return 'nats://localhost:4222';
      if (key === 'appName') return 'test-app';
      return null;
    }),
  };

  beforeEach(async () => {
    natsConnectionMock = {
      closed: jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          closedPromiseResolve = resolve;
        });
      }),
    };
    (connect as jest.Mock).mockResolvedValue(natsConnectionMock);

    module = await Test.createTestingModule({
      imports: [await ConfigModule.forRoot({ isGlobal: true }), NatsModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', async () => {
    expect(module).toBeDefined();
  });

  describe('NATS_CONNECTION_SERVICE provider', () => {
    it('should connect to NATS with correct config', async () => {
      const connection = module.get(NATS_CONNECTION_SERVICE);

      expect(connection).toBe(natsConnectionMock);

      expect(configService.getOrThrow).toHaveBeenCalledWith('nats.server');
      expect(configService.getOrThrow).toHaveBeenCalledWith('appName');

      expect(connect).toHaveBeenCalledWith({
        servers: 'nats://localhost:4222',
        name: 'test-app',
      });
    });

    it('should log message on clean connection close', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      module.get(NATS_CONNECTION_SERVICE);

      closedPromiseResolve(undefined);

      await new Promise(process.nextTick);

      expect(logSpy).toHaveBeenCalledWith('NATS connection closed cleanly');

      logSpy.mockRestore();
    });

    it('should log error on connection close with error', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      module.get(NATS_CONNECTION_SERVICE);

      const testError = new Error('Connection lost');
      closedPromiseResolve(testError);

      await new Promise(process.nextTick);

      expect(errorSpy).toHaveBeenCalledWith('NATS connection closed with error', testError);

      errorSpy.mockRestore();
    });
  });
});
