//Base Response Structure
export function baseResponse<T>(
  success: boolean,
  message: string,
  object: T | null = null,
  errors: string[] | null = null
) {
  return {
    Success: success,
    Message: message,
    Object: object,
    Errors: errors,
  };
}

// Paginated Response Structure
export function paginatedResponse<T>(
  success: boolean,
  message: string,
  object: T[],
  pageNumber: number,
  pageSize: number,
  totalSize: number,
  errors: string[] | null = null
) {
  return {
    Success: success,
    Message: message,
    Object: object,
    PageNumber: pageNumber,
    PageSize: pageSize,
    TotalSize: totalSize,
    Errors: errors,
  };
}