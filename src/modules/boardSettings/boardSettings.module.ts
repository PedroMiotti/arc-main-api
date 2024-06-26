import { Module } from '@nestjs/common';
import { BoardSettingsService } from './boardSettings.service';
import { BoardSettingsController } from './boardSettings.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [BoardSettingsController],
  providers: [BoardSettingsService],
})
export class BoardSettingsModule {}
