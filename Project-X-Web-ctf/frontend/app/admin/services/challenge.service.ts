import { apiClient, apiUpload } from "./api.client";

export const ChallengeService = {
  /** Get all challenges */
  list() {
    return apiClient("/admin/challenges");
  },

  /** Create challenge using FormData */
  create(fd: FormData) {
    return apiUpload("/admin/challenge", fd, "POST");
  },

  /** Delete a challenge by ID */
  delete(id: number) {
    return apiClient(`/admin/challenge/${id}`, {
      method: "DELETE",
    });
  },

  /** Toggle release state */
  toggle(id: number, released: boolean) {
    return apiClient(`/admin/challenge/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ released }),
    });
  },
};
