import { apiClient, apiUpload } from "./api.client";

export const ChallengeService = {
  list: () => apiClient("/admin/challenges"),

  create: (fd: FormData) => apiUpload("/admin/challenge", fd, "POST"),

  delete: (id: number) =>
    apiClient(`/admin/challenge/${id}`, { method: "DELETE" }),

  toggle: (id: number, released: boolean) =>
    apiClient(`/admin/challenge/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ released }),
    }),
};
