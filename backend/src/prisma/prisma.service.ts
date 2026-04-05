import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends (PrismaClient as any) implements OnModuleInit {
  [x: string]: any;

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      console.error('Prisma connection skipped during build/gen');
    }
  }

  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
