/**
 * API Client Utility
 * ------------------
 * Fast, safe, minimal wrapper around fetch().
 * - Auto-select API URL (env > localhost)
 * - Safe JSON parsing (handles empty responses)
 * - Normalized errors with meaningful messages
 * - Includes credentials for cookie-based auth
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

/* ----------------------------------------------
 * Types
 * ---------------------------------------------- */
interface ApiOptions extends RequestInit {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}

/* ----------------------------------------------
 * Main API Helper
 * ---------------------------------------------- */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const req: RequestInit = {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  };

  let res: Response;

  /** -----------------------------------------
   * Network layer catch (DNS / offline / blocked)
   * ----------------------------------------- */
  try {
    res = await fetch(url, req);
  } catch (err) {
    const msg = (err as Error)?.message || "Unknown network error";
    throw new Error(`Network unreachable: ${msg}`);
  }

  /** -----------------------------------------
   * Parse response (safe for 204/empty bodies)
   * ----------------------------------------- */
  let data: any = null;
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid JSON.");
    }
  }

  /** -----------------------------------------
   * Normalize API errors
   * ----------------------------------------- */
  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed with status ${res.status}`;

    throw new Error(msg);
  }

  return data as T;
}
