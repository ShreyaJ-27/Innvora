import { ApiErrorResponse, ApiSuccessResponse } from '../types/api';

// Use the deployed API Gateway URL — set via VITE_API_BASE_URL in .env.local
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string = 'API_ERROR', details?: unknown) {
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
  const url = `${API_BASE_URL}/${endpoint.replace(/^\/+/, '')}`;

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

    // Handle completely empty responses (e.g. 204 No Content)
    const text = await response.text();
    const data: unknown = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const errorResp = data as ApiErrorResponse;
      throw new ApiError(
        errorResp?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        errorResp?.error?.code || `HTTP_${response.status}`,
        (errorResp as any)?.error?.details
      );
    }

    const anyData = data as any;
    // Backend always wraps responses as { success: true, data: ... }
    if (anyData && anyData.success === false) {
      throw new ApiError(anyData.error?.message || 'Unknown API failure', anyData.error?.code);
    }

    const successResp = data as ApiSuccessResponse<T>;
    return (successResp.data !== undefined ? successResp.data : data) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new ApiError(
      message || 'Network request to Innvora API failed. Check your connection.',
      'NETWORK_ERROR'
    );
  }
}
