/**
 * API Client (JWT Bearer + JSON + File Upload + Production Ready)
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ----------------------------------------------
 * Token Helpers (Browser Safe)
 * ---------------------------------------------- */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

/* ----------------------------------------------
 * Types
 * ---------------------------------------------- */
interface ApiOptions extends RequestInit {
  auth?: boolean;  // attach Authorization token (default: true)
  json?: any;      // JSON body
  form?: FormData; // file upload
}

/* ----------------------------------------------
 * Main API Function
 * ---------------------------------------------- */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {

  if (!API_URL) {
    throw new Error("❌ API_URL missing. Set NEXT_PUBLIC_API_URL in .env");
  }

  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  /* ----------------------------------------------
   * Build Headers
   * ---------------------------------------------- */
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // Copy custom headers
  if (options.headers instanceof Headers) {
    options.headers.forEach((v, k) => (headers[k] = v));
  } else if (options.headers && typeof options.headers === "object") {
    for (const [k, v] of Object.entries(options.headers)) {
      if (typeof v === "string") headers[k] = v;
    }
  }

  /* ----------------------------------------------
   * Attach Bearer Token (unless disabled)
   * ---------------------------------------------- */
  // Attach Bearer token
  if (options.auth !== false) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
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
   * FormData Body
   * ---------------------------------------------- */
  if (options.form) {
    body = options.form;
    // IMPORTANT: Do NOT set Content-Type (browser sets it automatically)
    delete headers["Content-Type"];
  }

  /* ----------------------------------------------
   * Final Request
   * ---------------------------------------------- */
  const req: RequestInit = {
    method: options.method || "GET",
    headers,
    body,
    credentials: "omit", // since you use pure Bearer token
    mode: "cors",
  };

  /* ----------------------------------------------
   * Execute Request
   * ---------------------------------------------- */
  let res: Response;

  try {
    res = await fetch(url, req);
  } catch (error: any) {
    throw new Error(`🌐 Network error: ${error.message}`);
  }

  // successful "no content"
  if (res.status === 204) return null as T;

  // Parse JSON safely
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error("❌ Server returned invalid JSON.");
  }

  /* ----------------------------------------------
   * Auto 401 Handling
   * ---------------------------------------------- */
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  /* ----------------------------------------------
   * Handle Errors
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

/* Aliases */
export const api = apiFetch;
export const apiClient = apiFetch;
