import { Status } from './status.enum';

export interface Result<Data> {
  ok: boolean;
  status: Status;
  message: string;
  data: Data | null;
}

export class OkResult<Data> implements Result<Data> {
  ok: boolean;
  status: Status;
  message: string;
  data: Data | null;

  constructor(message?: string, data?: Data | null) {
    this.ok = true;
    this.status = Status.Ok;

    if (message !== undefined) {
      this.message = message;
    } else {
      this.message = Status.Ok;
    }

    if (data !== undefined) {
      this.data = data;
    } else {
      this.data = null;
    }
  }
}

export class ErrorResult<Data> implements Result<Data> {
  ok: boolean;
  status: Status;
  message: string;
  data: Data | null;

  constructor(status: Status, message?: string, data?: Data | null) {
    this.ok = false;
    this.status = status;

    if (message !== undefined) {
      this.message = message;
    } else {
      this.message = status;
    }

    if (data !== undefined) {
      this.data = data;
    } else {
      this.data = null;
    }
  }
}

export class PaginatedResult<Data> {
  message: string;
  data: Data | null;
  totalObjects: number;
  totalPages: number;

  constructor(
    message: string,
    data: Data | null,
    totalObjects: number,
    totalPages: number,
  ) {
    this.message = message;
    this.data = data;
    this.totalObjects = totalObjects;
    this.totalPages = totalPages;
  }
}
