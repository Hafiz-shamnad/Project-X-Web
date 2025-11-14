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
    throw new Error(text);
  }

  return res.json().catch(() => ({}));
}
