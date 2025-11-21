import { apiClient, apiUpload } from "./api.client";

export interface IChallengeService {
  list(): Promise<any>;
  create(formData: FormData): Promise<any>;
  delete(id: number): Promise<any>;
  toggle(id: number, released: boolean): Promise<any>;
}

export const ChallengeService: IChallengeService = {
  // GET /challenges
  list: async () => {
    return apiClient("/challenges", {
      method: "GET",
    });
  },

  // POST /challenges (FormData upload)
  create: async (formData: FormData) => {
    return apiUpload("/challenges", formData, "POST");
  },

  // DELETE /challenges/:id
  delete: async (id: number) => {
    return apiClient(`/challenges/${id}`, {
      method: "DELETE",
    });
  },

  // PATCH /challenges/:id/toggle-release
  toggle: async (id: number, released: boolean) => {
    return apiClient(`/challenges/${id}/toggle-release`, {
      method: "PATCH",
      json: { released },
    });
  },
};
