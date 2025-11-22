// app/lib/api.ts (FINAL Cookie Auth version)

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

async function safeJsonParse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000) {
  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
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

interface ApiOptions extends RequestInit {
  json?: any;
}

export async function apiClient<T = any>(endpoint: string, options: ApiOptions = {}) {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const method = options.method || "GET";
  const isJson = options.json !== undefined;

  // ❗ COOKIE auth ONLY — no authorization header
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: "include", // 🍪 ALWAYS send cookies
    body:
      method !== "GET"
        ? isJson
          ? JSON.stringify(options.json)
          : options.body
        : undefined,
    mode: "cors",
  };

  const res = await fetchWithTimeout(url, fetchOptions);
  const data = await safeJsonParse(res);

  // Auto redirect on 401
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
  }

  if (!res.ok) throw new Error(data?.error || data?.message || res.statusText);
  return data as T;
}

export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  method = "POST"
) {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetchWithTimeout(url, {
    method,
    credentials: "include", // 🍪 send cookies
    body: formData,
  });

  const data = await safeJsonParse(res);
  if (!res.ok) throw new Error(data?.error || "Upload failed");
  return data as T;
}

export const apiFetch = apiClient;
export const api = apiClient;
export const apiClientFetch = apiClient;
