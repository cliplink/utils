import {createPinoLoggerModule} from './create-pino-logger-module';
import {Params} from 'nestjs-pino';

describe('createPinoLoggerModule', () => {
  it('should return LoggerModule with default config', () => {
    const module = createPinoLoggerModule();
    expect(module).toBeDefined();
    
    // Check if providers array exists and contains the pino-params provider
    const providers = (module as any).providers;
    expect(providers).toBeDefined();
    const paramsProvider = providers.find((p: any) => p && p.provide === 'pino-params');
    expect(paramsProvider).toBeDefined();
  });

  it('should merge custom options', () => {
    const customOpts: Params = {pinoHttp: {level: 'debug'}};
    const module = createPinoLoggerModule(customOpts);
    
    const providers = (module as any).providers;
    const paramsProvider = providers.find((p: any) => p && p.provide === 'pino-params');
    
    const mergedLevel = paramsProvider.useValue.pinoHttp.level;
    expect(mergedLevel).toBe('debug');
  });
});