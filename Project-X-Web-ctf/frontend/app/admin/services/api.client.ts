// lib/api.ts — FINAL VERSION (supports auth: true)

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

interface ApiOptions extends RequestInit {
  json?: any;
  auth?: boolean; // <---- VERY IMPORTANT
}

async function safeParse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const method = options.method || "GET";
  const token =
    typeof window !== "undefined" && options.auth
      ? localStorage.getItem("token")
      : null;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    method,
    credentials: "omit", // NO cookies
    headers,
    body:
      method !== "GET"
        ? options.json
          ? JSON.stringify(options.json)
          : options.body
        : undefined,
  };

  const res = await fetch(url, config);
  const data = await safeParse(res);

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(msg);
  }

  return data as T;
}
