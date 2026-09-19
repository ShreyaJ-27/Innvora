export interface ApiGatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface ApiResponseOptions<T> {
  statusCode: number;
  body: T;
  headers?: Record<string, string>;
}

export function createApiResponse<T>({ statusCode, body, headers = {} }: ApiResponseOptions<T>): ApiGatewayResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export function createErrorResponse(statusCode: number, message: string, details?: Record<string, unknown>): ApiGatewayResponse {
  return createApiResponse({
    statusCode,
    body: {
      error: message,
      ...(details ? { details } : {})
    }
  });
}

export function createSuccessResponse<T>(data: T): ApiGatewayResponse {
  return createApiResponse({
    statusCode: 200,
    body: data
  });
}
