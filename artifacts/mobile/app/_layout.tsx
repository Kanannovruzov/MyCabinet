import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="documents"     options={{ headerShown: false }} />
            <Stack.Screen name="feedback"      options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
