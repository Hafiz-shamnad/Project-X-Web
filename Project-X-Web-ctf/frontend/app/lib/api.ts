/**
 * API Client (Cookie Auth + JSON + File Upload + CORS Safe)
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions extends RequestInit {
  json?: any;       // JSON body
  form?: FormData;  // Multipart body
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {

  if (!API_URL) {
    throw new Error("❌ API_URL missing. Set NEXT_PUBLIC_API_URL in .env");
  }

  const url = `${API_URL}${endpoint}`;

  /* ----------------------------------------------
   * BUILD HEADERS (BUT NO AUTHORIZATION)
   * ---------------------------------------------- */
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // Merge custom headers
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      if (typeof value === "string") {
        headers[key] = value;
      }
    }
  }

  // 💥 IMPORTANT: STRIP Authorization FOR COOKIE-ONLY AUTH
  delete headers["authorization"];
  delete headers["Authorization"];

  /* ----------------------------------------------
   * JSON BODY
   * ---------------------------------------------- */
  let body: BodyInit | undefined;

  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  /* ----------------------------------------------
   * FORM DATA (Browser sets boundary)
   * ---------------------------------------------- */
  if (options.form) {
    body = options.form;
    delete headers["Content-Type"];
  }

  /* ----------------------------------------------
   * FINAL FETCH (COOKIE MODE)
   * ---------------------------------------------- */
  const req: RequestInit = {
    method: options.method || "GET",
    headers,
    body,
    credentials: "include",  // ⬅ REQUIRED for cookies
    mode: "cors",
  };

  let res: Response;

  try {
    res = await fetch(url, req);
  } catch (err: any) {
    throw new Error(`🌐 Network error: ${err.message}`);
  }

  // No content
  if (res.status === 204) return null as T;

  // Try parse JSON
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error("❌ Backend returned invalid JSON.");
  }

  /* ----------------------------------------------
   *  AUTO-REDIRECT ON 401
   * ---------------------------------------------- */
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      console.warn("⚠ User unauthorized — redirecting to /login");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  /* ----------------------------------------------
   * HANDLE ERRORS CLEANLY
   * ---------------------------------------------- */
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data as T;
}

export const api = apiFetch;
export const apiClient = apiFetch;
