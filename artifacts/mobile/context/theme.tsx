import { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const secureGet = async (key: string) => {
  try {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  } catch {
    return AsyncStorage.getItem(key);
  }
};

const secureSet = async (key: string, value: string) => {
  try {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  } catch {
    return AsyncStorage.setItem(key, value);
  }
};

const secureDelete = async (key: string) => {
  try {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  } catch {
    return AsyncStorage.removeItem(key);
  }
};

export const DARK = {
  bg: '#060d1a',
  bg2: '#0a1628',
  surface: 'rgba(10,22,40,0.85)',
  glass: 'rgba(0,212,200,0.04)',
  glassBorder: 'rgba(0,212,200,0.12)',
  teal: '#00d4c8',
  blue: '#0057B7',
  white: '#FFFFFF',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.45)',
  red: '#EF4444',
  yellow: '#EAB308',
  green: '#22C55E',
  cardBg: '#0a1628',
  cardBorder: 'rgba(0,212,200,0.08)',
  divider: 'rgba(0,212,200,0.1)',
  inputBg: 'rgba(0,0,0,0.3)',
  statusBar: 'light' as const,
};

export const LIGHT = {
  bg: '#F0F4F8',
  bg2: '#FFFFFF',
  surface: 'rgba(255,255,255,0.85)',
  glass: 'rgba(0,212,200,0.06)',
  glassBorder: 'rgba(0,212,200,0.18)',
  teal: '#00A89E',
  blue: '#0057B7',
  white: '#FFFFFF',
  text: '#0F172A',
  textSecondary: 'rgba(15,23,42,0.55)',
  muted: 'rgba(15,23,42,0.5)',
  red: '#DC2626',
  yellow: '#CA8A04',
  green: '#16A34A',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(0,168,158,0.12)',
  divider: 'rgba(0,168,158,0.15)',
  inputBg: 'rgba(0,0,0,0.04)',
  statusBar: 'dark' as const,
};

export type ThemeColors = typeof DARK;

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (v: boolean) => void;
  pinEnabled: boolean;
  setPinEnabled: (v: boolean) => void;
  appPin: string | null;
  setAppPin: (v: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: DARK,
  toggleTheme: () => {},
  biometricEnabled: false,
  setBiometricEnabled: () => {},
  pinEnabled: false,
  setPinEnabled: () => {},
  appPin: null,
  setAppPin: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [biometricEnabled, setBiometric] = useState(false);
  const [pinEnabled, setPinState] = useState(false);
  const [appPin, setAppPinState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('theme'),
      AsyncStorage.getItem('biometric'),
      AsyncStorage.getItem('pinEnabled'),
      secureGet('appPin'),
    ]).then(([t, b, p, pin]) => {
      if (t === 'light') setIsDark(false);
      if (b === '1') setBiometric(true);
      if (p === '1') setPinState(true);
      if (pin) setAppPinState(pin);
      setLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const setBiometricEnabled = (v: boolean) => {
    setBiometric(v);
    AsyncStorage.setItem('biometric', v ? '1' : '0');
  };

  const setPinEnabled = (v: boolean) => {
    setPinState(v);
    AsyncStorage.setItem('pinEnabled', v ? '1' : '0');
  };

  const setAppPin = (v: string | null) => {
    setAppPinState(v);
    if (v) secureSet('appPin', v);
    else secureDelete('appPin');
  };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{
      isDark,
      colors: isDark ? DARK : LIGHT,
      toggleTheme,
      biometricEnabled,
      setBiometricEnabled,
      pinEnabled,
      setPinEnabled,
      appPin,
      setAppPin,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
