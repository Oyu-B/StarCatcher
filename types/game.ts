export type Difficulty = 'easy' | 'medium' | 'hard';
export type ScreenName = 'menu' | 'game';
export type StarColor = 'yellow' | 'blue' | 'red';

export type BestScores = Record<Difficulty, number>;

export type DifficultyConfig = {
  label: string;
  spawnInterval: number;
  starLifetime: number;
  description: string;
};

export type StarType = {
  color: StarColor;
  points: number;
  probability: number;
  emoji: string;
  label: string;
};

export type StarData = {
  id: number;
  position: number;
  color: StarColor;
  points: number;
  emoji: string;
  spawnedAt: number;
  expiring?: boolean;
};
