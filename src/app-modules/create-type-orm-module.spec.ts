// test/create-type-orm-module.spec.ts
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { createTypeOrmModule } from './create-type-orm-module';

interface TestConfig {
  database: {
    type: 'postgres';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

describe('createTypeOrmModule', () => {
  it('should register DataSource without connecting to database', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [
            (): TestConfig => ({
              database: {
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'test',
                password: 'test',
                database: 'test',
              },
            }),
          ],
        }),
        createTypeOrmModule<TestConfig>('database', {
          manualInitialization: true,
        }),
      ],
    }).compile();

    const dataSource = moduleRef.get(DataSource);

    expect(dataSource).toBeDefined();
    expect(dataSource.isInitialized).toBe(false);

    await moduleRef.close();
  });
});
