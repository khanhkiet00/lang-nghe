import { Module } from '@nestjs/common';
import { ArtisansService } from './artisans.service';
import { ArtisansController } from './artisans.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ArtisansService],
  controllers: [ArtisansController],
  exports: [ArtisansService],
})
export class ArtisansModule {}
