import { STAR_TYPES, TOTAL_CELLS } from '@/constants/game';
import type { StarData, StarType } from '@/types/game';

export function pickStarType(): StarType {
  const random = Math.random();

  if (random < 0.05) {
    return STAR_TYPES[2];
  }

  if (random < 0.3) {
    return STAR_TYPES[1];
  }

  return STAR_TYPES[0];
}

export function pickFreePosition(occupiedPositions: number[]): number | null {
  const occupied = new Set(occupiedPositions);
  const available: number[] = [];

  for (let index = 0; index < TOTAL_CELLS; index += 1) {
    if (!occupied.has(index)) {
      available.push(index);
    }
  }

  if (available.length === 0) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
}

export function createStar(position: number, idSeed: number): StarData {
  const type = pickStarType();

  return {
    id: Date.now() + idSeed,
    position,
    color: type.color,
    points: type.points,
    emoji: type.emoji,
    spawnedAt: Date.now(),
    expiring: false,
  };
}

export function formatTime(seconds: number): string {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainingSeconds = String(Math.max(0, seconds) % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}
