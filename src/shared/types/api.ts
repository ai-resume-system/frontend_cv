export interface IResponseApiPagination {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface IResponseApiMeta {
  status: boolean;
  message: string;
}

export interface IResponseApiList<T> {
  meta: IResponseApiMeta;
  data: T[];
  pagination?: IResponseApiPagination;
}

export interface IResponseApiItem<T> {
  meta: IResponseApiMeta;
  data: T;
}
