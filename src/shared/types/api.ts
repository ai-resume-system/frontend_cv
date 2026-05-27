export interface IResponseApiPagination {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface IResponseApiItem<T> {
  status: string;
  message: string;
  data: T;
}

export interface IResponseApiList<T> {
  status: string;
  message: string;
  data: T[];
  pagination?: IResponseApiPagination;
}

export interface IResponseApiError {
  status: string;
  message: string;
  code?: string | number;
  error?: {
    code?: string;
    fields?: Record<string, string[]>;
  };
}
