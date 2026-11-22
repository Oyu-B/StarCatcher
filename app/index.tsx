import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import GameBoard from '@/components/game/game-board';
import MenuScreen from '@/components/game/menu-screen';
import { COLORS } from '@/constants/theme';
import type { BestScores, Difficulty, ScreenName } from '@/types/game';

const INITIAL_BEST_SCORES: BestScores = {
  easy: 0,
  medium: 0,
  hard: 0,
};

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [bestScores, setBestScores] = useState<BestScores>(INITIAL_BEST_SCORES);
  const [roundKey, setRoundKey] = useState(0);

  const openGame = () => {
    setRoundKey((current) => current + 1);
    setCurrentScreen('game');
  };

  const handleGameEnd = (
    finalScore: number,
    _catchCount: number,
    isNewRecord: boolean,
    nextDifficulty: Difficulty
  ) => {
    if (!isNewRecord) {
      return;
    }

    setBestScores((current) => ({
      ...current,
      [nextDifficulty]: finalScore,
    }));
  };

  return (
    <View style={styles.screen}>
      {currentScreen === 'menu' ? (
        <MenuScreen
          bestScores={bestScores}
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          onStartGame={openGame}
        />
      ) : (
        <GameBoard
          key={`${difficulty}-${roundKey}`}
          bestScore={bestScores[difficulty]}
          difficulty={difficulty}
          onBackToMenu={() => setCurrentScreen('menu')}
          onGameEnd={handleGameEnd}
          onReplay={openGame}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
});
