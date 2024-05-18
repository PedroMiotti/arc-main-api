import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
