import { memo, useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { COLORS } from '@/constants/theme';
import type { StarColor, StarData } from '@/types/game';

type StarProps = {
  cellSize: number;
  onCatch: (starId: number) => void;
  onExpireComplete: (starId: number) => void;
  star: StarData;
};

const STAR_STYLES: Record<StarColor, { background: string; border: string; glow: string; emoji: string }> = {
  yellow: {
    background: 'rgba(255, 215, 0, 0.16)',
    border: '#B8860B',
    glow: COLORS.gold,
    emoji: '★',
  },
  blue: {
    background: 'rgba(96, 165, 250, 0.16)',
    border: '#2563EB',
    glow: '#60A5FA',
    emoji: '★',
  },
  red: {
    background: 'rgba(248, 113, 113, 0.18)',
    border: '#DC2626',
    glow: '#F87171',
    emoji: '★',
  },
};

function Star({ cellSize, onCatch, onExpireComplete, star }: StarProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 650,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    });

    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [glow, opacity, scale]);

  useEffect(() => {
    if (!star.expiring) {
      return;
    }

    pulseLoop.current?.stop();
    glow.stopAnimation();

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.7,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => onExpireComplete(star.id));
  }, [glow, onExpireComplete, opacity, scale, star.expiring, star.id]);

  const handlePress = useCallback(() => {
    if (star.expiring) {
      return;
    }

    scale.stopAnimation();
    glow.stopAnimation();
    pulseLoop.current?.stop();

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.55,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onCatch(star.id));
  }, [glow, onCatch, opacity, scale, star.expiring, star.id]);

  const palette = STAR_STYLES[star.color];
  const starSize = Math.min(cellSize * 0.72, 54);
  const pulseOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: cellSize,
          height: cellSize,
          opacity: Animated.multiply(opacity, pulseOpacity),
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={star.expiring}
        onPress={handlePress}
        style={[
          styles.button,
          {
            width: starSize,
            height: starSize,
            borderRadius: starSize / 2,
            backgroundColor: palette.background,
            borderColor: palette.border,
            shadowColor: palette.glow,
          },
        ]}
      >
        <Text
          style={{
            color: palette.glow,
            fontSize: starSize * 0.56,
            fontWeight: '900',
            textShadowColor: palette.glow,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
          }}
        >
          {palette.emoji}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(Star);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
});
