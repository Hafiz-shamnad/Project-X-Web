/**
 * API Client (JWT Bearer + JSON + File Upload + Production Ready)
 */

// Load token safely (browser only)
function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ----------------------------------------------
 * Types
 * ---------------------------------------------- */
interface ApiOptions extends RequestInit {
  auth?: boolean;  // attach Authorization Bearer token (default: true)
  json?: any;      // JSON body
  form?: FormData; // FormData upload
}

/* ----------------------------------------------
 * Main Fetch Function
 * ---------------------------------------------- */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {

  if (!API_URL) {
    throw new Error("API_URL is missing. Set NEXT_PUBLIC_API_URL in .env");
  }

  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  /* ----------------------------------------------
   * Construct Headers
   * ---------------------------------------------- */
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // Apply incoming headers
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (options.headers && typeof options.headers === "object") {
    for (const [key, value] of Object.entries(options.headers)) {
      if (typeof value === "string") headers[key] = value;
    }
  }

  // Attach Bearer Token (once only)
  if (options.auth !== false && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;

  /* ----------------------------------------------
   * JSON Body
   * ---------------------------------------------- */
  if (options.json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  /* ----------------------------------------------
   * FormData Upload
   * ---------------------------------------------- */
  if (options.form) {
    body = options.form;
    // IMPORTANT: Do NOT set Content-Type manually for FormData
  }

  /* ----------------------------------------------
   * Final Request Options
   * ---------------------------------------------- */
  const req: RequestInit = {
    method: options.method || "GET",
    mode: "cors",
    headers,
    body,
  };

  /* ----------------------------------------------
   * Execute Request
   * ---------------------------------------------- */
  let res: Response;

  try {
    res = await fetch(url, req);
  } catch (err) {
    throw new Error(
      `Network unreachable: ${(err as Error)?.message || "Unknown error"}`
    );
  }

  // No Content Responses
  if (res.status === 204) return null as T;

  let data: any;

  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response from server.");
  }

  /* ----------------------------------------------
   * Automatic 401 Handling
   * ---------------------------------------------- */
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized — Login required");
  }

  /* ----------------------------------------------
   * Error Handling
   * ---------------------------------------------- */
  if (!res.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      `Request failed with status ${res.status}`
    );
  }

  return data as T;
}

/* ----------------------------------------------
 * Backward Compatibility Exports
 * ---------------------------------------------- */
export const apiClient = apiFetch;
export const api = apiFetch;
