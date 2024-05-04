export class PaginationFilter {
  PageNumber = 1;
  PageSize = 5;
  skip: number;
  take: number;

  constructor(pageNumber?: number, pageSize?: number) {
    if (pageNumber !== undefined && pageNumber > 1) {
      this.PageNumber = +pageNumber;
    }
    if (pageSize !== undefined && pageSize > 0) {
      this.PageSize = +pageSize;
    }

    this.skip = this.PageSize * (this.PageNumber - 1);
    this.take = this.PageSize;
  }
}
