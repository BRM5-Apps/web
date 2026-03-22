/** Standard API response envelope — matches apps/api/pkg/response/response.go */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

/** API error shape from the Go backend */
export interface ApiError {
  code: string;
  message: string;
}

/** Paginated API response envelope */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  error?: ApiError;
}

/** Pagination metadata returned by the API */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Query parameters for paginated requests */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
