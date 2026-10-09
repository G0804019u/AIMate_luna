import '../global.css';
import { Stack } from 'expo-router';
import React from 'react';
import { LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { ThemeProvider } from './contexts/ThemeContext';
import useThemedNavigation from './hooks/useThemedNavigation';

import { DrawerProvider } from '@/app/contexts/DrawerContext';

LogBox.ignoreLogs(['InteractionManager has been deprecated', 'SafeAreaView has been deprecated']);

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();

  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      className={`bg-background ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`}
      style={{ flex: 1 }}>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <ThemeProvider>
          <DrawerProvider>
            <ThemedLayout />
          </DrawerProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
