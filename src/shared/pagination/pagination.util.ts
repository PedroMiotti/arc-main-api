import { Links, Pagination } from '../http/http-response.interface';

export function calculateTotalPages(
  pageSize: number,
  objectsCount: number,
): number {
  if (pageSize >= objectsCount) {
    return 1;
  }

  const ratio: number = objectsCount / pageSize;
  if (Number.isInteger(ratio)) {
    return ratio;
  }

  return Math.floor(ratio) + 1;
}

export class PaginationLinks implements Links {
  First: string;
  Previous?: string;
  Self: string;
  Next?: string;
  Last: string;

  constructor(
    serviceUrl: string,
    resource: string,
    currentPage: number,
    pageSize: number,
    lastPage: number,
  ) {
    resource = serviceUrl + resource;

    this.Self = `${resource}?PageNumber=${currentPage}&PageSize=${pageSize}`;
    this.First = `${resource}?PageNumber=1&PageSize=${pageSize}`;
    this.Last = `${resource}?PageNumber=${lastPage}&PageSize=${pageSize}`;

    if (currentPage > 1) {
      const prev = currentPage - 1;
      this.Previous = `${resource}?PageNumber=${prev}&PageSize=${pageSize}`;
    }

    const next = currentPage + 1;
    if (next > lastPage || lastPage == 1) {
      return;
    }

    this.Next = `${resource}?PageNumber=${next}&PageSize=${pageSize}`;
  }
}

export class PaginationResponse implements Pagination {
  TotalPages: number;
  CurrentPage: number;
  PageSize: number;
  TotalObjects: number;
  Links: Links;

  constructor(
    resource: string,
    serviceUrl: string,
    totalPages: number,
    currentPage: number,
    pageSize: number,
    totalObjects: number,
  ) {
    this.TotalPages = totalPages;
    this.TotalObjects = totalObjects;
    this.CurrentPage = currentPage;
    this.PageSize = pageSize;

    this.Links = new PaginationLinks(
      serviceUrl,
      resource,
      currentPage,
      pageSize,
      totalPages,
    );
  }
}
