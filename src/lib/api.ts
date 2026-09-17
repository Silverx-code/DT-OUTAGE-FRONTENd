/**
 * Thin fetch wrapper around the Spring Boot backend.
 *
 * NEXT_PUBLIC_API_BASE_URL should point at the Spring app, e.g.
 * http://localhost:8080/api during local dev. The bearer token comes from
 * whatever auth flow wraps this (NextAuth session, etc.) — wire it up in
 * getAuthToken() once auth is in place. Until then this throws in a way
 * that's easy to spot rather than silently sending unauthenticated calls.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

let unauthorizedRedirectStarted = false;

import { getAccessToken } from "./msal";

async function getAuthToken(): Promise<string | null> {
  return getAccessToken();
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("gridline-unauthorized"));
      if (window.location.pathname !== "/login" && !unauthorizedRedirectStarted) {
        unauthorizedRedirectStarted = true;
        window.location.assign("/login?reason=session-expired");
      }
    }
    throw new ApiError(res.status, body || res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};

export { ApiError };
