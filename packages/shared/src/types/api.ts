// API Error Types
export type CommonErrorCode = 
  | 'SERVER_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR';

export type AuthErrorCode = 
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID'
  | 'AUTH_EXPIRED';

export type SubscriptionErrorCode = 
  | 'SUBSCRIPTION_ERROR'
  | 'SUBSCRIPTION_EXPIRED'
  | 'QUOTA_EXCEEDED'
  | 'FEATURE_UNAVAILABLE';

export type ResourceErrorCode = 
  | 'USER_NOT_FOUND'
  | 'CONTRACT_NOT_FOUND'
  | 'FILE_NOT_FOUND';

export type ValidationErrorCode = 
  | 'FILE_SIZE_LIMIT'
  | 'INVALID_FILE_TYPE'
  | 'INVALID_REQUEST';

export type ApiErrorCode = 
  | CommonErrorCode
  | AuthErrorCode
  | SubscriptionErrorCode
  | ResourceErrorCode
  | ValidationErrorCode;

export interface ApiErrorResponse {
  error: string;
  code: ApiErrorCode;
  message?: string;
  path?: string;
  validationErrors?: { [key: string]: string };
  [key: string]: any;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    [key: string]: any;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// API Request/Response Types
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  environment: string;
  version?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResponse {
  success: boolean;
  errors?: ValidationError[];
}
