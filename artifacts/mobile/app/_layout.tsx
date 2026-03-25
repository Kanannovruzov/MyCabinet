import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import {
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth';
import { ThemeProvider, useTheme } from '@/context/theme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  initialRouteName: 'index',
};

function useFontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          ...MaterialIcons.font,
          ...Feather.font,
        });
      } catch (e) {
        console.warn('Font loading failed, continuing with fallback:', e);
      } finally {
        setFontsLoaded(true);
      }
    })();
  }, []);

  return fontsLoaded;
}

function InnerLayout() {
  const { colors } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 350,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="login" options={{ animation: 'fade_from_bottom', animationDuration: 500 }} />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'fade',
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="documents"
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="feedback"
          options={{
            animation: 'slide_from_bottom',
            animationDuration: 350,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
      </Stack>
      <StatusBar style={colors.statusBar} />
    </>
  );
}

export default function RootLayout() {
  const fontsLoaded = useFontLoader();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#060d1a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00D4C8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <InnerLayout />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
