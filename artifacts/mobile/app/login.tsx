import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import ParticlesBg from '@/components/particles-bg';

const LOGIN_URL = 'https://seafarer.ddla.gov.az/login?mobile=1';

const BG    = '#060d1a';
const TEAL  = '#00d4c8';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.4)';

export default function LoginScreen() {
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDeepLink = (url: string) => {
    const parsed = Linking.parse(url);
    if (parsed.path === 'auth') {
      const session = parsed.queryParams?.session as string | undefined;
      const pin     = parsed.queryParams?.pin     as string | undefined;
      if (session && pin) {
        setAuth(session, pin);
        router.replace('/(tabs)');
      }
    }
  };

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });
    return () => sub.remove();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await WebBrowser.openBrowserAsync(LOGIN_URL, {
        dismissButtonStyle: 'cancel',
        presentationStyle: Platform.OS === 'ios'
          ? WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN
          : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ParticlesBg />

      <View style={styles.topBadge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>DÖVLƏTİN RƏSMİ PLATFORMU</Text>
        <View style={styles.badgeDot} />
      </View>

      <View style={styles.center}>
        <View style={styles.glowOuter}>
          <View style={styles.glowInner}>
            <View style={styles.anchorCircle}>
              <Text style={styles.anchorIcon}>⚓</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>
          Xoş gəldiniz,{'\n'}
          <Text style={styles.titleAccent}>SeaDDLA</Text>
        </Text>
        <Text style={styles.subtitle}>Dənizçi Şəxsi Kabineti</Text>

        <View style={styles.ddlaPill}>
          <Text style={styles.ddlaText}>Dövlət Dəniz və Liman Agentliyi</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.mygovBtn}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={TEAL} size="small" />
          ) : (
            <View style={styles.mygovRow}>
              <View style={styles.mygovDot} />
              <Text style={styles.mygovText}>myGov ID ilə daxil ol</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>2026 © Bütün hüquqlar qorunur</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 0.9, shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    color: TEAL,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  glowOuter: {
    width: 120, height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,212,200,0.04)',
  },
  glowInner: {
    width: 90, height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,212,200,0.08)',
  },
  anchorCircle: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,212,200,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,212,200,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorIcon: { fontSize: 28 },
  title: {
    color: WHITE,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
  },
  titleAccent: { color: TEAL },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  ddlaPill: {
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,212,200,0.06)',
    marginTop: 8,
  },
  ddlaText: {
    color: TEAL,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottom: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  mygovBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: TEAL,
    backgroundColor: 'rgba(0,212,200,0.1)',
    alignItems: 'center',
    shadowColor: TEAL,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  mygovRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mygovDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 1, shadowRadius: 6,
  },
  mygovText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    color: MUTED,
    fontSize: 11,
    textAlign: 'center',
  },
});
