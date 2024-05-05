import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from './guards/jwt.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRE_TIME'),
        },
      }),
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [JwtGuard, AuthService, LocalStrategy, JwtService],
  exports: [JwtGuard, JwtService],
})

export class AuthModule {}