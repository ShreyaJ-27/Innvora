export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface HttpErrorDetails {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
