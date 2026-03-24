import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth';
import { ThemeProvider, useTheme } from '@/context/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  initialRouteName: 'index',
};

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
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <InnerLayout />
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
