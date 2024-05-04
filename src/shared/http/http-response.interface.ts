export default interface HttpResponse {
  Meta?: Meta;
  Data?: unknown;
  Error?: Error;
  Pagination?: Pagination;
}

interface Meta {
  Status?: number;
  Message?: string;
}

interface Error {
  Status?: number;
  Title?: string;
  Description?: string;
}

export interface Pagination {
  TotalPages: number;
  CurrentPage: number;
  PageSize: number;
  TotalObjects: number;
  Links: Links;
}

export interface Links {
  First: string;
  Previous?: string;
  Self: string;
  Next?: string;
  Last: string;
}
