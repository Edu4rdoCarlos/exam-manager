export interface PaginationMetadata {
  readonly page: number;
  readonly perPage: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface HttpResponseBody<T> {
  readonly data: T;
}

export interface HttpPaginatedResponseBody<T> {
  readonly data: T[];
  readonly metadata: PaginationMetadata;
}

export class HttpResponse {
  static of<T>(data: T): HttpResponseBody<T> {
    return { data };
  }

  static paginated<T>(data: T[], metadata: PaginationMetadata): HttpPaginatedResponseBody<T> {
    return { data, metadata };
  }
}
