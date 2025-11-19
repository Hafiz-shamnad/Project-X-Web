// Normalize base URL — remove trailing slash
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/* -------------------------------------------------------
   Utility: Safe JSON parsing (never throws)
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
   Fetch with timeout (prevents stuck requests)
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
   Extract meaningful backend errors
------------------------------------------------------- */
function extractError(data: any, fallback: string) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  return fallback;
}

/* -------------------------------------------------------
   MAIN API CLIENT (JSON requests)
------------------------------------------------------- */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetchWithTimeout(
    url,
    {
      ...options,
      method: options.method || "GET",
      credentials: "include", // necessary for cookies
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    },
    15000
  );

  const data = await safeJsonParse(res);

  if (!res.ok) {
    throw new Error(extractError(data, res.statusText));
  }

  return data as T;
}

/* -------------------------------------------------------
   UPLOAD CLIENT (FormData — no JSON headers)
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
      credentials: "include", // include JWT cookies
      body: formData,
    },
    20000
  );

  const data = await safeJsonParse(res);

  if (!res.ok) {
    throw new Error(extractError(data, "Upload failed"));
  }

  return data as T;
}
