// app/projectx/types/Challenge.ts

export interface Challenge {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  released?: boolean;
  hasContainer?: boolean;
}
