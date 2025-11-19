// Normalize base URL — remove trailing slash
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/* -------------------------------------------------------
   Safe JSON parsing
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
   Extract backend error
------------------------------------------------------- */
function extractError(data: any, fallback: string) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  return fallback;
}

/* -------------------------------------------------------
   MAIN API CLIENT — FIXED (JSON)
------------------------------------------------------- */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Handle JSON bodies properly
  const isJsonBody =
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData);

  const fetchOptions: RequestInit = {
    ...options,
    method: options.method || "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body:
      options.method !== "GET"
        ? isJsonBody
          ? JSON.stringify(options.body) // FIXED
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

/* -------------------------------------------------------
   UPLOAD CLIENT (FormData)
------------------------------------------------------- */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  method: string = "POST"
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetchWithTimeout(
    url,
    {
      method,
      credentials: "include",
      body: formData, // do NOT set Content-Type — browser does it
    },
    20000
  );

  const data = await safeJsonParse(res);

  if (!res.ok) {
    throw new Error(extractError(data, "Upload failed"));
  }

  return data as T;
}
