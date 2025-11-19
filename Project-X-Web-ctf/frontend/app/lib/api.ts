/**
 * API Client (JWT Bearer + JSON + File Upload + Production Ready)
 */
// TOP OF api.ts
console.log("🔥 API FILE LOADED (server)");
if (typeof window !== "undefined") {
  console.log("🔥 API FILE LOADED (client)");
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("API_URL FROM FRONTEND:", API_URL);

/* ----------------------------------------------
 * Types
 * ---------------------------------------------- */
interface ApiOptions extends RequestInit {
  auth?: boolean;        // attach Authorization Bearer token (default: true)
  json?: any;            // JSON body
  form?: FormData;       // FormData upload
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

  // Load token only in browser
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ----------------------------------------------
   * Construct Headers
   * ---------------------------------------------- */

  /* ----------------------------------------------
 * Normalize Headers Safely
 * ---------------------------------------------- */
  const normalizedHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  // Convert incoming headers → simple string map
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      normalizedHeaders[key] = value;
    });
  } else if (options.headers && typeof options.headers === "object") {
    for (const [key, value] of Object.entries(options.headers)) {
      if (typeof value === "string") {
        normalizedHeaders[key] = value;
      }
    }
  }

  // Attach Bearer Token
  if (options.auth !== false && token) {
    normalizedHeaders["Authorization"] = `Bearer ${token}`;
  }

  // JSON Body
  if (options.json) {
    normalizedHeaders["Content-Type"] = "application/json";
  }

  // Final headers object
  const headers = normalizedHeaders;


  // Add Bearer Token unless explicitly disabled
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
    // DO NOT manually set Content-Type for FormData
  }

  /* ----------------------------------------------
   * Final fetch request
   * ---------------------------------------------- */
  const req: RequestInit = {
    method: options.method || "GET",
    credentials: "include",
    mode: "cors",
    headers,
    body,
  };

  let res: Response;

  try {
    res = await fetch(url, req);
  } catch (err) {
    throw new Error(
      `Network unreachable: ${(err as Error)?.message || "Unknown error"}`
    );
  }

  // Handle No Content responses
  if (res.status === 204) return null as T;

  let data: any;

  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response from server.");
  }

  /* ----------------------------------------------
   * Automatic 401 Logout
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
   * General Error Handling
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
export const apiClient = apiFetch; // old name still works
export const api = apiFetch;       // convenient alias
