import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { COLORS } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: COLORS.bgDeep,
          },
        }}
      />
      <StatusBar style="light" backgroundColor={COLORS.bgDeep} />
    </>
  );
}
