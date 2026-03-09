/** Standard API response envelope */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Standard API error response */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
