/**
 * Utility type: Nullable
 */
export type Nullable<T> = T | null;

/**
 * Utility type: Optional
 */
export type Optional<T> = T | undefined;

/**
 * Utility type: DeepPartial (Aman untuk Array dan Date)
 */
export type DeepPartial<T> = T extends Function | Date | (any[]) // Abaikan tipe bawaan JS
  ? T
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
/**
 * Pagination metadata
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

/**
 * Response sukses (data wajib ada)
 */
export type ApiSuccessResponse<T = unknown> = {
  success: true; // Literal 'true'
  data: T;
  message?: string;
  pagination?: PaginationMeta;
};

/**
 * Response gagal (error wajib ada, tidak ada data)
 */
export type ApiErrorResponse = {
  success: false; // Literal 'false'
  error: string;
  message?: string;
  // Anda bisa menambahkan 'errorCode' atau 'details' di sini nantinya
};

/**
 * API Response wrapper (Discriminated Union)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Date range filter
 */
export type DateRange = {
  startDate?: string;
  endDate?: string;
};

/**
 * ID type (UUID string)
 */
export type ID = string;

/**
 * Timestamp (ISO string)
 */
export type Timestamp = string;
