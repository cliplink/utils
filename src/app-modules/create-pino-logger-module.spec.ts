import { Params } from 'nestjs-pino';

import { createPinoLoggerModule } from './create-pino-logger-module';

describe('createPinoLoggerModule', () => {
  it('should return LoggerModule with default config', () => {
    const module = createPinoLoggerModule();
    expect(module).toBeDefined();

    const providers = module.providers;
    expect(providers).toBeDefined();
    const paramsProvider = providers?.find((p) => p && p.provide === 'pino-params');
    expect(paramsProvider).toBeDefined();
  });

  it('should merge custom options', () => {
    const customOpts: Params = { pinoHttp: { level: 'debug' } };
    const module = createPinoLoggerModule(customOpts);

    const providers = module.providers;
    const paramsProvider = providers?.find((p) => p && p.provide === 'pino-params');

    const mergedLevel = paramsProvider?.useValue.pinoHttp.level;
    expect(mergedLevel).toBe('debug');
  });
});
