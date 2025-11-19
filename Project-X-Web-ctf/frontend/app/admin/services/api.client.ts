// app/lib/api.ts (Bearer Token Version)

// Normalize base URL
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

// ---------- safe json ----------
async function safeJsonParse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------- timeout ----------
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 15000
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timeout"));
    }, timeoutMs);

    fetch(url, options)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ---------- extract backend error ----------
function extractError(data: any, fallback: string) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  return data?.error || data?.message || fallback;
}

// ---------- MAIN API CLIENT ----------
interface ApiOptions extends RequestInit {
  json?: any;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const method = options.method || "GET";
  const isJson = options.json !== undefined;

  // Load token from localStorage (browser only)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers,
    credentials: "omit",       // <-- very important (no cookies)
    body:
      method !== "GET"
        ? isJson
          ? JSON.stringify(options.json)
          : options.body
        : undefined,
  };

  const res = await fetchWithTimeout(url, fetchOptions);
  const data = await safeJsonParse(res);

  if (!res.ok) {
    throw new Error(extractError(data, res.statusText));
  }

  return data as T;
}

// Upload (FormData)
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  method = "POST"
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetchWithTimeout(url, {
    method,
    credentials: "omit",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = await safeJsonParse(res);

  if (!res.ok) throw new Error(extractError(data, "Upload failed"));

  return data as T;
}

export const apiFetch = apiClient; // backward compatibility
