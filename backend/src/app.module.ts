import { Module } from '@nestjs/common';
import { AppController, HealthController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ArtisansModule } from './artisans/artisans.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ArtisansModule, UploadModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
