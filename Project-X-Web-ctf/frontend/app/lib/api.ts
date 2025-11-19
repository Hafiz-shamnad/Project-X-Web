/**
 * API Client Utility (Production-Optimized)
 * Handles:
 *  - Full CORS + cookie support
 *  - Safe JSON parsing
 *  - Works on Vercel + Railway
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    credentials: "include",   // REQUIRED for cookies to work
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body:
      options.method && options.method !== "GET"
        ? options.body
        : undefined,
  };

  let res: Response;

  // NETWORK ERRORS (DNS fail, CORS block, backend offline)
  try {
    res = await fetch(url, req);
  } catch (err) {
    throw new Error(
      `Network unreachable: ${(err as Error)?.message || "Unknown error"}`
    );
  }

  // SAFELY PARSE JSON
  let data: any = null;
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid JSON response.");
    }
  }

  // NORMALIZE API ERRORS
  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
