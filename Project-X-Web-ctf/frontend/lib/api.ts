/**
 * API Client Utility
 * ------------------
 * Centralized HTTP wrapper for communicating with the backend API.
 * Features:
 *  - Automatic base URL selection (env or localhost fallback)
 *  - Normalized JSON requests
 *  - Cookie forwarding (required for JWT authentication)
 *  - Consistent error handling and response formatting
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Sends a request to the backend API.
 *
 * @param endpoint - API endpoint path, starting with '/'
 * @param options  - Fetch API options (method, body, headers, etc.)
 *
 * @returns Parsed JSON response or throws on network failure
 *
 * Example:
 *   apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) })
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const requestOptions: RequestInit = {
    credentials: "include", // Required for HTTP-only cookie authentication
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  let response: Response;

  try {
    response = await fetch(url, requestOptions);
  } catch (err) {
    throw new Error(`Network error: ${(err as Error).message}`);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid JSON response from server.");
  }

  // Normalize errors based on HTTP status codes
  if (!response.ok) {
    const message = data?.error || data?.message || "API request failed";
    throw new Error(message);
  }

  return data as T;
}
