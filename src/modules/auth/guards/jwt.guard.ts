import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate = async (context: ExecutionContext): Promise<any> => {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublicRoute = this.reflector.get<boolean>(
      'isPublicRoute',
      context.getHandler(),
    );

    if (isPublicRoute) return true;

    return this.validateRequest(request);
  };

  validateRequest = async (request: Request): Promise<any> => {
    const token = request.headers['authorization'] as string;

    if (!token) {
      throw new UnauthorizedException(
        "Request is missing 'Authorization' header.",
      );
    }

    const [type, rawToken] = token.split(' ');
    if (type !== 'Bearer') {
      throw new UnauthorizedException(
        "'Authorization header is not of type 'Bearer'.",
      );
    } else if (!rawToken) {
      throw new UnauthorizedException('Invalid Bearer token.');
    }

    if (token) return this.checkIsTokenValid(rawToken);

    throw new UnauthorizedException();
  };

  checkIsTokenValid = async (token: string): Promise<boolean> => {
    try {
      const isTokenValid = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET_KEY'),
      });

      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid Bearer token.');
      }

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'Invalid Bearer token.',
        JSON.stringify(error),
      );
    }
  };
}
