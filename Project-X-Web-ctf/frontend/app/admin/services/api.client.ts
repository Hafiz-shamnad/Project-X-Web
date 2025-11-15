const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || res.statusText);
  }

  return data;
}

export async function apiUpload(
  endpoint: string,
  formData: FormData,
  method: string = "POST"
) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    let clean: any = {};

    try {
      clean = JSON.parse(text);
    } catch {
      // text was not JSON → ignore
    }

    const errorMessage =
      (clean && typeof clean.error === "string" && clean.error) ||
      text ||
      "Unknown error";

    throw new Error(errorMessage);
  }

  return res.json().catch(() => ({}));
}
