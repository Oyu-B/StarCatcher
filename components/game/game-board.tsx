import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { COMBO_MIN_COUNT, COMBO_MULTIPLIER, COMBO_WINDOW_MS, DIFFICULTY_CONFIG, GAME_DURATION, GRID_SIZE, TIMER_WARNING_SECONDS } from '@/constants/game';
import { COLORS, FONTS, SPACE, shared } from '@/constants/theme';
import type { Difficulty, StarData } from '@/types/game';
import { createStar, formatTime, pickFreePosition } from '@/utils/game';

import ResultModal from './result-modal';
import Star from './star';

type GameBoardProps = {
  bestScore: number;
  difficulty: Difficulty;
  onBackToMenu: () => void;
  onGameEnd: (
    finalScore: number,
    catchCount: number,
    isNewRecord: boolean,
    difficulty: Difficulty
  ) => void;
  onReplay: () => void;
};

const GRID_GAP = 6;
const GRID_PADDING = SPACE.lg;
const GRID_CELLS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => index);

type GridCellProps = {
  cellSize: number;
  column: number;
  onCatch: (starId: number) => void;
  onExpireComplete: (starId: number) => void;
  row: number;
  star?: StarData;
};

const GridCell = memo(function GridCell({
  cellSize,
  column,
  onCatch,
  onExpireComplete,
  row,
  star,
}: GridCellProps) {
  return (
    <View
      style={[
        styles.cell,
        {
          top: row * (cellSize + GRID_GAP),
          left: column * (cellSize + GRID_GAP),
          width: cellSize,
          height: cellSize,
        },
      ]}
    >
      <View style={styles.cellDot} />
      {star ? (
        <Star
          cellSize={cellSize}
          onCatch={onCatch}
          onExpireComplete={onExpireComplete}
          star={star}
        />
      ) : null}
    </View>
  );
});

export default function GameBoard({
  bestScore,
  difficulty,
  onBackToMenu,
  onGameEnd,
  onReplay,
}: GameBoardProps) {
  const { width } = useWindowDimensions();
  const [isPlaying, setIsPlaying] = useState(true);
  const [stars, setStars] = useState<StarData[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [catchCount, setCatchCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [comboActive, setComboActive] = useState(false);

  const config = DIFFICULTY_CONFIG[difficulty];
  const comboFlash = useRef(new Animated.Value(0)).current;
  const hasEndedRef = useRef(false);
  const isPlayingRef = useRef(true);
  const starIdCounter = useRef(0);
  const scoreRef = useRef(0);
  const catchCountRef = useRef(0);
  const lastCatchTimeRef = useRef(0);
  const comboCountRef = useRef(0);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefs = useRef<
    Record<number, { expire?: ReturnType<typeof setTimeout> }>
  >({});

  const { boardWidth, cellSize, gridHeight } = useMemo(() => {
    const nextBoardWidth = Math.min(width - GRID_PADDING * 2, 380);
    const nextCellSize =
      (nextBoardWidth - GRID_GAP * (GRID_SIZE - 1)) / GRID_SIZE;

    return {
      boardWidth: nextBoardWidth,
      cellSize: nextCellSize,
      gridHeight: GRID_SIZE * nextCellSize + (GRID_SIZE - 1) * GRID_GAP,
    };
  }, [width]);

  const clearTimers = useCallback(() => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
      comboTimerRef.current = null;
    }

    Object.values(timeoutRefs.current).forEach((timers) => {
      if (timers.expire) {
        clearTimeout(timers.expire);
      }
    });
    timeoutRefs.current = {};
  }, []);

  const removeStar = useCallback((starId: number) => {
    setStars((current) => current.filter((star) => star.id !== starId));
  }, []);

  const scheduleExpiry = useCallback(
    (star: StarData) => {
      const timeoutId = setTimeout(() => {
        if (!isPlayingRef.current) {
          return;
        }

        setStars((current) =>
          current.map((currentStar) =>
            currentStar.id === star.id
              ? { ...currentStar, expiring: true }
              : currentStar
          )
        );
      }, config.starLifetime);

      timeoutRefs.current[star.id] = { expire: timeoutId };
    },
    [config.starLifetime]
  );

  const triggerComboFlash = useCallback(() => {
    comboFlash.setValue(1);
    Animated.timing(comboFlash, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [comboFlash]);

  const endGame = useCallback(() => {
    if (hasEndedRef.current) {
      return;
    }

    hasEndedRef.current = true;
    isPlayingRef.current = false;
    setIsPlaying(false);
    clearTimers();
    setStars([]);
    setComboActive(false);
    setComboCount(0);

    const finalScore = scoreRef.current;
    const finalCatchCount = catchCountRef.current;
    const recordBroken = finalScore > bestScore;

    setIsNewRecord(recordBroken);
    setShowResult(true);
    onGameEnd(finalScore, finalCatchCount, recordBroken, difficulty);
  }, [bestScore, clearTimers, difficulty, onGameEnd]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    spawnIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) {
        return;
      }

      setStars((current) => {
        const position = pickFreePosition(current.map((star) => star.position));

        if (position === null) {
          return current;
        }

        starIdCounter.current += 1;
        const nextStar = createStar(position, starIdCounter.current);
        scheduleExpiry(nextStar);
        return [...current, nextStar];
      });
    }, config.spawnInterval);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
    };
  }, [config.spawnInterval, isPlaying, scheduleExpiry]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (timeLeft === 0) {
      endGame();
    }
  }, [endGame, timeLeft]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleCatch = useCallback(
    (starId: number) => {
      if (!isPlayingRef.current) {
        return;
      }

      setStars((current) => {
        const tappedStar = current.find((star) => star.id === starId);

        if (!tappedStar || tappedStar.expiring) {
          return current;
        }

        const timers = timeoutRefs.current[starId];
        if (timers?.expire) {
          clearTimeout(timers.expire);
        }
        delete timeoutRefs.current[starId];

        const now = Date.now();
        const isComboChain = now - lastCatchTimeRef.current <= COMBO_WINDOW_MS;
        const nextComboCount = isComboChain ? comboCountRef.current + 1 : 1;
        const comboUnlocked = nextComboCount >= COMBO_MIN_COUNT;
        const multiplier = comboUnlocked ? COMBO_MULTIPLIER : 1;
        const earnedPoints = tappedStar.points * multiplier;

        lastCatchTimeRef.current = now;
        comboCountRef.current = nextComboCount;
        scoreRef.current += earnedPoints;
        catchCountRef.current += 1;

        setComboCount(nextComboCount);
        setComboActive(comboUnlocked);
        setScore(scoreRef.current);
        setCatchCount(catchCountRef.current);

        if (comboUnlocked) {
          triggerComboFlash();
        }

        if (comboTimerRef.current) {
          clearTimeout(comboTimerRef.current);
        }

        comboTimerRef.current = setTimeout(() => {
          comboCountRef.current = 0;
          setComboCount(0);
          setComboActive(false);
        }, COMBO_WINDOW_MS);

        return current.filter((star) => star.id !== starId);
      });
    },
    [triggerComboFlash]
  );

  const timerColor = timeLeft <= TIMER_WARNING_SECONDS ? COLORS.danger : COLORS.accent;
  const starsByPosition = useMemo(
    () => new Map(stars.map((star) => [star.position, star])),
    [stars]
  );

  return (
    <SafeAreaView style={[shared.screen, shared.safeArea]}>
      <View style={styles.header}>
        <View style={styles.headerPill}>
          <Text style={styles.pillLabel}>⏱</Text>
          <Text style={[styles.pillValue, { color: timerColor }]}>{formatTime(timeLeft)}</Text>
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.comboBadge,
            {
              opacity: comboActive
                ? comboFlash.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.6],
                  })
                : 0,
            },
          ]}
        >
          <Text style={styles.comboText}>🔥 Цуврал {COMBO_MULTIPLIER} дахин</Text>
          <Text style={styles.comboSub}>{comboCount} дараалсан барилт</Text>
        </Animated.View>

        <View style={styles.headerPill}>
          <Text style={styles.pillLabel}>⭐</Text>
          <Text style={styles.pillValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.bestScoreRow}>
        <Text style={styles.bestScoreLabel}>Дээд оноо</Text>
        <Text style={styles.bestScoreValue}>{bestScore > 0 ? bestScore : '---'}</Text>
      </View>

      <View style={styles.gridWrapper}>
        <View style={[styles.grid, { width: boardWidth, height: gridHeight }]}>
          {GRID_CELLS.map((index) => {
            const row = Math.floor(index / GRID_SIZE);
            const column = index % GRID_SIZE;
            const star = starsByPosition.get(index);

            return (
              <GridCell
                cellSize={cellSize}
                column={column}
                key={index}
                onCatch={handleCatch}
                onExpireComplete={removeStar}
                row={row}
                star={star}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} onPress={endGame} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>⏹ Гарах</Text>
        </TouchableOpacity>

        <View style={styles.difficultyPill}>
          <Text style={styles.difficultyText}>{config.label}</Text>
        </View>

        <View style={styles.recordPill}>
          <Text style={styles.recordPillText}>
            Дээд оноо: {bestScore > 0 ? bestScore : 0}
          </Text>
        </View>
      </View>

      <ResultModal
        catchCount={catchCount}
        difficulty={difficulty}
        isNewRecord={isNewRecord}
        onMenu={() => {
          setShowResult(false);
          onBackToMenu();
        }}
        onReplay={() => {
          setShowResult(false);
          onReplay();
        }}
        score={score}
        visible={showResult}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.sm,
  },
  headerPill: {
    minWidth: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs + 2,
  },
  pillLabel: {
    fontSize: FONTS.md,
    marginRight: SPACE.xs,
  },
  pillValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.lg,
    fontWeight: '800',
  },
  comboBadge: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 14,
    backgroundColor: `${COLORS.gold}20`,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
  },
  comboText: {
    color: COLORS.gold,
    fontSize: FONTS.sm,
    fontWeight: '900',
  },
  comboSub: {
    color: COLORS.gold,
    fontSize: FONTS.xs,
  },
  bestScoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACE.md,
    gap: SPACE.sm,
  },
  bestScoreLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  bestScoreValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.base,
    fontWeight: '700',
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
  },
  grid: {
    position: 'relative',
  },
  cell: {
    position: 'absolute',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.lg,
  },
  secondaryButton: {
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.base,
    fontWeight: '700',
  },
  difficultyPill: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 12,
    backgroundColor: COLORS.accentDim,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs + 2,
  },
  difficultyText: {
    color: COLORS.accent,
    fontSize: FONTS.sm,
    fontWeight: '700',
  },
  recordPill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs + 2,
  },
  recordPillText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: '700',
  },
});
