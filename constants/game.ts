import type { Difficulty, DifficultyConfig, StarType } from '@/types/game';

export const GRID_SIZE = 4;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const GAME_DURATION = 30;

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Хялбар',
    spawnInterval: 1200,
    starLifetime: 2000,
    description: '1.2с / 2.0с',
  },
  medium: {
    label: 'Дунд',
    spawnInterval: 900,
    starLifetime: 1500,
    description: '0.9с / 1.5с',
  },
  hard: {
    label: 'Хүнд',
    spawnInterval: 600,
    starLifetime: 1000,
    description: '0.6с / 1.0с',
  },
};

export const STAR_TYPES: StarType[] = [
  { color: 'yellow', points: 1, probability: 0.7, emoji: '★', label: 'Шар' },
  { color: 'blue', points: 3, probability: 0.25, emoji: '★', label: 'Цэнхэр' },
  { color: 'red', points: 5, probability: 0.05, emoji: '★', label: 'Улаан' },
];

export const COMBO_MIN_COUNT = 3;
export const COMBO_WINDOW_MS = 3000;
export const COMBO_MULTIPLIER = 2;
export const TIMER_WARNING_SECONDS = 5;
