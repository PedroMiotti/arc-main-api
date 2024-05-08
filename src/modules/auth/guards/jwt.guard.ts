import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Http2ServerRequest } from 'http2';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate = async (context: ExecutionContext): Promise<any> => {
    const request = context.switchToHttp().getRequest<Http2ServerRequest>();
    const isPublicRoute = this.reflector.get<boolean>(
      'isPublicRoute',
      context.getHandler(),
    );

    if (isPublicRoute) return true;

    return this.validateRequest(request);
  };

  validateRequest = async (request: Http2ServerRequest): Promise<any> => {
    const token = request.headers['authorization'] as string;

    if (token) return this.checkAuth(token);

    throw new UnauthorizedException();
  };

  checkAuth = async (token: string): Promise<boolean> => {
    try {
      if (!token) {
        throw new BadRequestException(
          "Request is missing 'Authorization' header.",
        );
      }

      const [type, rawToken] = token.split(' ');
      if (type !== 'Bearer') {
        throw new BadRequestException(
          "'Authorization header is not of type 'Bearer'.",
        );
      } else if (!rawToken) {
        throw new BadRequestException('Invalid Bearer token.');
      }

      const isTokenValid = await this.jwtService.verifyAsync(rawToken, {
        secret: this.configService.get('JWT_SECRET_KEY'),
      });
      if (!isTokenValid) {
        throw new BadRequestException('Invalid Bearer token.');
      }

      this.jwtService.decode(token, { json: true });
      return true;
    } catch (error) {
      throw new BadRequestException('Invalid Bearer token.');
    }
  };
}
