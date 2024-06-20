import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateClientDto, AuthenticateDto } from './dto/authenticate.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { SessionDto } from './dto/session.dto';
import { User } from '@prisma/client';
import { TokenRefreshDto } from './dto/token-refresh.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Authenticate user by email and password' })
  @Post('login')
  async authenticateUser(
    @Body() _AuthenticateDto: AuthenticateDto,
    @Request() req: Request & { user: User },
  ): Promise<SessionDto> {
    return this.authService.createAuthenticatedSession(req.user);
  }

  @ApiOperation({ summary: 'Authenticate client user by Document' })
  @Post('login/client')
  async authenticateClientUser(
    @Body() dto: AuthenticateClientDto,
  ): Promise<SessionDto> {
    return this.authService.authenticateClientUser(dto.document);
  }

  @Post('tokens/refresh')
  @ApiOperation({ summary: 'Refresh session with refresh token' })
  refreshAccessToken(@Body() tokenRefreshDto: TokenRefreshDto) {
    return this.authService.generateAccessTokenFromRefreshToken(
      tokenRefreshDto,
    );
  }
}
