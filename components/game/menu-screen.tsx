import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { DIFFICULTY_CONFIG } from "@/constants/game";
import { COLORS, FONTS, SPACE, shared } from "@/constants/theme";
import type { BestScores, Difficulty } from "@/types/game";

type MenuScreenProps = {
  bestScores: BestScores;
  difficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onStartGame: () => void;
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: COLORS.easy,
  medium: COLORS.medium,
  hard: COLORS.hard,
};

export default function MenuScreen({
  bestScores,
  difficulty,
  onSelectDifficulty,
  onStartGame,
}: MenuScreenProps) {
  const selectedBestScore = bestScores[difficulty];

  return (
    <SafeAreaView style={[shared.screen, shared.safeArea]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🌟</Text>
          <Text style={styles.heroTitle}>Од барих</Text>
          <Text style={styles.heroSubtitle}>Хариу үйлдлийн тоглоом</Text>
          <Text style={styles.heroTagline}>Хурд, анхаарал</Text>
        </View>

        <View style={[shared.card, styles.cardSpacing]}>
          <Text style={shared.sectionTitle}>Дүрэм</Text>
          <View style={styles.ruleRow}>
            <Text style={[styles.ruleEmoji, styles.yellowStar]}>★</Text>
            <Text style={styles.ruleText}>Шар од 1 оноо</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={[styles.ruleEmoji, styles.blueStar]}>★</Text>
            <Text style={styles.ruleText}>Цэнхэр од 3 оноо</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={[styles.ruleEmoji, styles.redStar]}>★</Text>
            <Text style={styles.ruleText}>Улаан од 5 оноо</Text>
          </View>
          <Text style={styles.comboHint}>
            3 дараалж барьж чадвал оноо 2 дахин нэмэгдэнэ.
          </Text>
        </View>

        <View style={styles.cardSpacing}>
          <Text style={shared.sectionTitle}>Хүндрэл сонгох</Text>
          <View style={styles.difficultyRow}>
            {(
              Object.entries(DIFFICULTY_CONFIG) as [
                Difficulty,
                (typeof DIFFICULTY_CONFIG)[Difficulty],
              ][]
            ).map(([key, config]) => {
              const isActive = difficulty === key;
              const accentColor = DIFFICULTY_COLORS[key];

              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.85}
                  onPress={() => onSelectDifficulty(key)}
                  style={[
                    styles.difficultyCard,
                    {
                      borderColor: isActive ? accentColor : COLORS.border,
                      backgroundColor: isActive
                        ? `${accentColor}20`
                        : COLORS.bgCard,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyTitle,
                      isActive && { color: accentColor },
                    ]}
                  >
                    {config.label}
                  </Text>
                  <Text style={styles.difficultyMeta}>
                    {config.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[shared.card, styles.scoreCard]}>
          <Text style={shared.sectionTitle}>
            {DIFFICULTY_CONFIG[difficulty].label} түвшний рекорд
          </Text>
          <Text style={styles.scoreValue}>
            {selectedBestScore > 0 ? `⭐ ${selectedBestScore}` : "0"}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onStartGame}
          style={[shared.primaryButton, styles.startButton]}
        >
          <Text style={shared.primaryButtonText}>Тоглоом эхлүүлэх</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.xl,
    paddingBottom: SPACE.xxl,
  },
  hero: {
    alignItems: "center",
    marginBottom: SPACE.xl,
  },
  heroIcon: {
    fontSize: 70,
    marginBottom: SPACE.sm,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.xxl,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroSubtitle: {
    color: COLORS.accent,
    fontSize: FONTS.base,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
  },
  heroTagline: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: SPACE.xs,
  },
  cardSpacing: {
    marginBottom: SPACE.lg,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACE.xs,
  },
  ruleEmoji: {
    fontSize: 18,
    marginRight: SPACE.sm,
  },
  yellowStar: {
    color: COLORS.gold,
  },
  blueStar: {
    color: COLORS.accent,
  },
  redStar: {
    color: COLORS.hard,
  },
  ruleText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.base,
  },
  comboHint: {
    color: COLORS.gold,
    fontSize: FONTS.sm,
    fontWeight: "700",
    marginTop: SPACE.sm,
  },
  difficultyRow: {
    flexDirection: "row",
    gap: SPACE.sm,
  },
  difficultyCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.sm,
    alignItems: "center",
  },
  difficultyTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.base,
    fontWeight: "800",
    marginBottom: 4,
  },
  difficultyMeta: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
  },
  scoreCard: {
    alignItems: "center",
    marginBottom: SPACE.xl,
  },
  scoreValue: {
    color: COLORS.gold,
    fontSize: FONTS.xl,
    fontWeight: "900",
  },
  startButton: {
    minHeight: 58,
  },
});
