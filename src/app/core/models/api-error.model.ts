export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND'
}

export class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public override message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
