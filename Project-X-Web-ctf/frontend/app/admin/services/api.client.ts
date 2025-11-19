// Normalize base URL — remove trailing slash
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/* -------------------------------------------------------
   Safe JSON parsing (never throws)
------------------------------------------------------- */
async function safeJsonParse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text || null;
  }
}

/* -------------------------------------------------------
   Timeout wrapper
------------------------------------------------------- */
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 15000
): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
}

/* -------------------------------------------------------
   Extract backend errors
------------------------------------------------------- */
function extractError(data: any, fallback: string) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.error) return data.error;
  if (data.message) return data.message;
  return fallback;
}

/* -------------------------------------------------------
   MAIN API CLIENT (supports json: {})
------------------------------------------------------- */
interface ApiOptions extends RequestInit {
  json?: any; // <----- ADD THIS
}

export async function apiClient<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const method = options.method || "GET";

  const isJson = options.json !== undefined;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.headers || {}),
    ...(isJson ? { "Content-Type": "application/json" } : {}),
  };

  const fetchOptions: RequestInit = {
    ...options,
    method,
    credentials: "include",
    headers,
    body:
      method !== "GET"
        ? isJson
          ? JSON.stringify(options.json)
          : options.body
        : undefined,
  };

  const res = await fetchWithTimeout(url, fetchOptions);
  const data = await safeJsonParse(res);

  if (!res.ok) throw new Error(extractError(data, res.statusText));

  return data as T;
}

/* -------------------------------------------------------
   Upload (FormData)
------------------------------------------------------- */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  method = "POST"
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetchWithTimeout(
    url,
    {
      method,
      credentials: "include",
      body: formData,
    },
    20000
  );

  const data = await safeJsonParse(res);

  if (!res.ok) throw new Error(extractError(data, "Upload failed"));

  return data as T;
}

// For backward compatibility
export const apiFetch = apiClient;
