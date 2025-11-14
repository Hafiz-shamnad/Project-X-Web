import { apiClient } from "./api.client";

export const TeamService = {
  list: () => apiClient("/admin/teams"),

  ban: (id: number, durationMinutes: number) =>
    apiClient(`/admin/team/${id}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationMinutes }),
    }),

  unban: (id: number) =>
    apiClient(`/admin/team/${id}/unban`, { method: "POST" }),

  penalty: (id: number, points: number) =>
    apiClient(`/admin/team/${id}/penalty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ penalty: points }),
    }),
};
