export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      details?: Record<string, unknown>;
      cause?: unknown;
    } = {}
  ) {
    super(message);

    this.name = 'AppError';
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.details = options.details;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, {
      statusCode: 404,
      code: 'NOT_FOUND'
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, {
      statusCode: 409,
      code: 'CONFLICT'
    });
  }
}
