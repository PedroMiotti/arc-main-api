import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { decode } from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Jwt = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) {
      return null;
    }

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') {
      return null;
    } else if (token === undefined) {
      return null;
    }

    return decode(token, { json: true }) as JwtClaims;
  },
);

export interface JwtClaims {
  Id: number;
  Email: string;
  ClientId: string;
  OwnerId: number;
  UserTypeId: number;
  iat: number;
  exp: number;
}
