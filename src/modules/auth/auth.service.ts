import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { PayloadDto } from './dto/payload.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { Status } from 'src/shared/result/status.enum';
import { ErrorResult } from 'src/shared/result/result.interface';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private configService: ConfigService,
    private jwtTokenService: JwtService,
  ) {}

  async createAuthenticatedSession(user: User) {
    const generatedClientId = crypto.randomBytes(16).toString('hex');

    const { AccessToken, RefreshToken, ExpiresIn } = this.generateCredentials(
      user,
      generatedClientId,
    );

    const sessionRecord: Prisma.SessionUncheckedCreateInput = {
      Token: await bcrypt.hash(RefreshToken, 10),
      ClientId: generatedClientId,
      UserId: user.Id,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    await this.prismaService.session.create({
      data: sessionRecord,
    });

    return { AccessToken, ExpiresIn, RefreshToken };
  }

  async validateUserCredentials(Email: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        Email,
        DeletedAt: null,
        IsActive: true,
      },
    });

    if (!user)
      throw new HttpException(
        'Incorrect email or password.',
        HttpStatus.BAD_REQUEST,
      );

    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (!isPasswordValid)
      throw new HttpException(
        'Incorrect email or password.',
        HttpStatus.BAD_REQUEST,
      );

    return user;
  }

  async authenticateClientUser(document: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        Document: document,
        UserTypeId: 4,
        DeletedAt: null,
      },
    });

    if (!user)
      throw new HttpException('Incorrect credentials.', HttpStatus.BAD_REQUEST);

    if (!user.IsActive)
      throw new HttpException('User is no longer active.', HttpStatus.BAD_REQUEST);

    return this.createAuthenticatedSession(user);
  }

  generateCredentials(user: User, clientId: string, refreshToken?: string) {
    const payload: Partial<PayloadDto> = {
      Id: user.Id,
      Email: user.Email,
      ClientId: clientId,
      OwnerId: user.ParentId ?? user.Id,
    };

    return {
      AccessToken: this.jwtTokenService.sign(payload, {
        secret:
          this.configService.get<string>('JWT_SECRET_KEY') ??
          process.env['JWT_SECRET_KEY'] ??
          '',
        expiresIn: 3600,
      }),
      ExpiresIn:
        this.configService.get<string>('JWT_EXPIRE_TIME') ??
        process.env['JWT_EXPIRE_TIME'] ??
        '',
      RefreshToken:
        refreshToken ??
        this.jwtTokenService.sign(payload, this.getRefreshTokenOptions()),
    };
  }

  async generateAccessTokenFromRefreshToken(tokenRefreshDto: TokenRefreshDto) {
    const accessTokenDecoded: PayloadDto = this.jwtTokenService.decode(
      tokenRefreshDto.accessToken,
    );

    const refreshTokenDecoded: PayloadDto = this.jwtTokenService.decode(
      tokenRefreshDto.refreshToken,
    );

    if (!accessTokenDecoded || !refreshTokenDecoded)
      throw new HttpException('Token cannot be decoded', HttpStatus.NOT_FOUND);

    const refreshTokenExpirationDate = new Date(refreshTokenDecoded.exp * 1000);

    const isRefreshTokenExpired = refreshTokenExpirationDate < new Date();

    if (isRefreshTokenExpired)
      throw new HttpException('Refresh token is expired', HttpStatus.NOT_FOUND);

    const session = await this.prismaService.session.findFirst({
      where: {
        ClientId: accessTokenDecoded.ClientId,
      },
    });

    if (!session)
      throw new HttpException(
        'The provided token is no longer valid',
        HttpStatus.FORBIDDEN,
      );

    const storedRefreshToken = session.Token;

    const user = await this.prismaService.user.findFirst({
      where: {
        Id: session.UserId,
      },
    });

    if (!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN);

    const isRefreshTokenMatching = await bcrypt.compare(
      tokenRefreshDto.refreshToken,
      storedRefreshToken,
    );

    if (!isRefreshTokenMatching)
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);

    await this.jwtTokenService.verifyAsync(
      tokenRefreshDto.refreshToken,
      this.getRefreshTokenOptions(),
    );

    return this.generateCredentials(
      user,
      session.ClientId,
      tokenRefreshDto.refreshToken,
    );
  }

  private getRefreshTokenOptions() {
    const options: JwtSignOptions = {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET_KEY') ??
        process.env['JWT_REFRESH_SECRET_KEY'] ??
        '',
    };

    const expiration: string =
      this.configService.get<string>('JWT_REFRESH_EXPIRE_TIME') ??
      process.env['JWT_REFRESH_EXPIRE_TIME'] ??
      '';
    if (expiration) options.expiresIn = expiration;

    return options;
  }
}
