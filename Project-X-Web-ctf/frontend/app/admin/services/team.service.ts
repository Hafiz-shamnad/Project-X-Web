import { apiClient } from "./api.client";

export const TeamService = {
  /** Fetch all teams */
  list() {
    return apiClient("/admin/teams");
  },

  /** Temporary ban (duration in minutes) */
  ban(id: number, durationMinutes: number) {
    return apiClient(`/admin/team/${id}/ban`, {
      method: "POST",
      body: JSON.stringify({ durationMinutes }),
    });
  },

  /** Remove ban */
  unban(id: number) {
    return apiClient(`/admin/team/${id}/unban`, {
      method: "POST",
    });
  },

  /** Apply penalty (deduct points) */
  penalty(id: number, points: number) {
    return apiClient(`/admin/team/${id}/penalty`, {
      method: "POST",
      body: JSON.stringify({ penalty: points }),
    });
  },
};
