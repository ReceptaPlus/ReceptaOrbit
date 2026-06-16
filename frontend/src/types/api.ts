export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: { code: string; message: string };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
