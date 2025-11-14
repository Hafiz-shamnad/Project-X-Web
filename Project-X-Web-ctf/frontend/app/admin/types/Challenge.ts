export interface Challenge {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  points: number;
  released: boolean;
  filePath?: string | null;
  createdAt?: string;
}
