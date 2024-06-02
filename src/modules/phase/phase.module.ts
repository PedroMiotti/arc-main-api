import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [PhaseController],
  providers: [PhaseService],
})
export class PhaseModule {}
