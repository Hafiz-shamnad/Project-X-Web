export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // ✅ important for cookies
  });
  return await res.json();
}
