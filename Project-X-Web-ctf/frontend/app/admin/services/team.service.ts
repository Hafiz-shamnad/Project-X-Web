import { apiClient } from "./api.client";

export const TeamService = {
  /** Fetch all teams */
  list() {
    return apiClient("/admin/teams");
  },

  /** Temporary / permanent ban */
  ban(id: number, durationMinutes: number) {
    return apiClient(`/admin/team/${id}/ban`, {
      method: "POST",
      json: { durationMinutes },   // ✅ correct key, correct format
    });
  },

  /** Remove ban */
  unban(id: number) {
    return apiClient(`/admin/team/${id}/unban`, {
      method: "POST",
    });
  },

  /** Apply penalty */
  penalty(id: number, points: number) {
    return apiClient(`/admin/team/${id}/penalty`, {
      method: "POST",
      json: { penalty: points },  // ✅ backend expects "penalty"
    });
  },
};
