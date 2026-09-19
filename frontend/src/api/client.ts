import { ApiErrorResponse, ApiSuccessResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorResp = data as ApiErrorResponse;
      throw new ApiError(
        errorResp.error?.message || `HTTP error ${response.status}: ${response.statusText}`,
        errorResp.error?.code || `HTTP_${response.status}`,
        errorResp.error?.details
      );
    }

    const anyData = data as any;
    if (anyData && anyData.success === false) {
      throw new ApiError(anyData.error?.message || 'Unknown API failure', anyData.error?.code);
    }

    const successResp = data as ApiSuccessResponse<T>;
    return (successResp.data !== undefined ? successResp.data : data) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Network connection to StockPulse API failed. Please check your backend connection.',
      'NETWORK_ERROR'
    );
  }
}
