import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DRIZZLE } from './db/drizzle.module.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          all: async () => [],
        }),
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

describe('AppService', () => {
  it('should return users from the database', async () => {
    const db = {
      select: () => ({
        from: () => ({
          all: async () => [],
        }),
      }),
    };

    const appService = new AppService(db as any);

    await expect(appService.getUsers()).resolves.toEqual([]);
  });
});
