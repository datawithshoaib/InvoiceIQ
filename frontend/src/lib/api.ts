// Browser-side API client. Requests go to /api/v1/*, which next.config.ts rewrites to FastAPI.

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (d as { msg?: string }).msg ?? String(d))
        .join("; ");
    }
  }
  return fallback;
}

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const response = await fetch(`/api/v1${path}`, {
    ...rest,
    headers:
      json !== undefined
        ? { "Content-Type": "application/json", ...headers }
        : headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      errorMessage(body, `Request failed (${response.status})`),
      response.status,
    );
  }
  return body as T;
}
