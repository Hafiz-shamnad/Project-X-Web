/**
 * API Client (JWT + File Upload + Production Optimized)
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ----------------------------------------------
 * Types
 * ---------------------------------------------- */
interface ApiOptions extends RequestInit {
  auth?: boolean;            // Whether to attach Bearer token
  json?: any;                // JSON body
  form?: FormData;           // FormData (file upload)
}

/* ----------------------------------------------
 * Main API Helper
 * ---------------------------------------------- */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers: any = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // Attach Bearer token unless disabled
  if (options.auth !== false && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body: BodyInit | undefined = undefined;

  // JSON Body
  if (options.json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  // File upload FormData
  if (options.form) {
    body = options.form;
    // ❗ DO NOT set Content-Type here — browser sets it properly
  }

  const req: RequestInit = {
    method: options.method || "GET",
    credentials: "include",
    mode: "cors",
    headers,
    body,
  };

  let res: Response;

  // NETWORK ERRORS
  try {
    res = await fetch(url, req);
  } catch (err) {
    throw new Error(
      `Network unreachable: ${(err as Error)?.message || "Unknown error"}`
    );
  }

  // EMPTY RESPONSE
  if (res.status === 204) return null as T;

  // SAFE JSON PARSE
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response from server.");
  }

  // 401 → auto redirect to login
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error("Authentication required");
  }

  // Handle all non-200 errors
  if (!res.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed with status ${res.status}`
    );
  }

  return data as T;
}
