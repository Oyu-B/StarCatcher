import { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, FONTS, SPACE, shared } from '@/constants/theme';
import type { Difficulty } from '@/types/game';

type ResultModalProps = {
  catchCount: number;
  difficulty: Difficulty;
  isNewRecord: boolean;
  onMenu: () => void;
  onReplay: () => void;
  score: number;
  visible: boolean;
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Хялбар',
  medium: 'Дунд',
  hard: 'Хүнд',
};

export default function ResultModal({
  catchCount,
  difficulty,
  isNewRecord,
  onMenu,
  onReplay,
  score,
  visible,
}: ResultModalProps) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const orbitX = useRef(new Animated.Value(140)).current;
  const orbitY = useRef(new Animated.Value(-70)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.7);
      opacity.setValue(0);
      orbitX.setValue(140);
      orbitY.setValue(-70);
      spin.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(spin, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbitX, {
            toValue: -90,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(orbitY, {
            toValue: 110,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orbitX, {
            toValue: 55,
            duration: 170,
            useNativeDriver: true,
          }),
          Animated.timing(orbitY, {
            toValue: -35,
            duration: 170,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orbitX, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(orbitY, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [opacity, orbitX, orbitY, scale, spin, visible]);

  const spinRotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Modal animationType="none" statusBarTranslucent transparent visible={visible}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [
                { translateX: orbitX },
                { translateY: orbitY },
                { rotate: spinRotation },
                { scale },
              ],
            },
          ]}
        >
          <Text style={styles.emoji}>🏆</Text>
          <Text style={styles.title}>Тоглоом дууслаа!</Text>

          {isNewRecord ? (
            <View style={styles.recordBadge}>
              <Text style={styles.recordText}>⭐ ШИНЭ ДЭЭД ОНОО!</Text>
            </View>
          ) : null}

          <View style={styles.scoreWrap}>
            <Text style={styles.scoreLabel}>Оноо</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{catchCount}</Text>
              <Text style={styles.statLabel}>Барьсан од</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{DIFFICULTY_LABELS[difficulty]}</Text>
              <Text style={styles.statLabel}>Түвшин</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onReplay}
            style={[shared.primaryButton, styles.primaryAction]}
          >
            <Text style={shared.primaryButtonText}>Дахин тоглох</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={onMenu} style={styles.secondaryAction}>
            <Text style={styles.secondaryText}>Цэс рүү буцах</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 6, 15, 0.9)',
    paddingHorizontal: SPACE.xl,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    backgroundColor: COLORS.bgCard,
    padding: SPACE.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: SPACE.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.xl,
    fontWeight: '800',
    marginBottom: SPACE.md,
  },
  recordBadge: {
    borderRadius: 999,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.xs,
    marginBottom: SPACE.md,
  },
  recordText: {
    color: COLORS.bgDeep,
    fontSize: FONTS.sm,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreWrap: {
    alignItems: 'center',
    marginBottom: SPACE.xl,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: SPACE.xs,
  },
  scoreValue: {
    color: COLORS.accent,
    fontSize: FONTS.hero,
    fontWeight: '900',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACE.xl,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  primaryAction: {
    width: '100%',
    marginBottom: SPACE.md,
  },
  secondaryAction: {
    paddingVertical: SPACE.sm,
  },
  secondaryText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.base,
    fontWeight: '600',
  },
});
