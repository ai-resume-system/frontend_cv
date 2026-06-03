export interface ApiPagination {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface ApiItemResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  status: string;
  message: string;
  data: T[];
  pagination?: ApiPagination;
}

export interface ApiErrorResponse {
  status?: string;
  message?: string;
  code?: number | string;
}

export interface ApiFieldErrorResponse extends ApiErrorResponse {
  error?: {
    fields?: Record<string, string[]>;
  };
}

export interface FieldErrors {
  [key: string]: string | undefined;
}

export interface AppApiError extends Error {
  displayMessage: string;
  fields?: Record<string, string[]>;
  rawMessage: string;
  status?: number;
}

export type IResponseApiPagination = ApiPagination;
export type IResponseApiItem<T> = ApiItemResponse<T>;
export type IResponseApiList<T> = ApiListResponse<T>;
