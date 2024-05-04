import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import HttpResponse from './http-response.interface';

export function handleResponse(
  response: Response,
  status: HttpStatus,
  json?: HttpResponse,
): void {
  if (json === undefined) {
    response.status(status).end();
    return;
  }

  if (json.Meta !== undefined) {
    json.Meta.Status = status;
  }

  response.status(status).json(json);
}
