export class APIError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function createAPIError(
  message: string,
  status: number = 500,
  data?: Record<string, unknown>
) {
  return new APIError(message, status, data);
}
