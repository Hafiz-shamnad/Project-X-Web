export interface TeamMember {
  id: number;
  username: string;
}

export interface Team {
  id: number;
  name: string;
  totalScore?: number;
  solvedCount?: number;
  members?: TeamMember[];
  joinCode?: string;
  bannedUntil?: string | null;
  penaltyPoints?: number | null;
}
