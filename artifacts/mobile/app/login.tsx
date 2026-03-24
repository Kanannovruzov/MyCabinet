import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';

const LOGIN_URL = 'https://seafarer.ddla.gov.az/login?mobile=1';

const { width } = Dimensions.get('window');

const BG     = '#040C1A';
const TEAL   = '#00D4C8';
const BLUE   = '#0057B7';
const WHITE  = '#FFFFFF';
const MUTED  = 'rgba(255,255,255,0.45)';
const MUTED2 = 'rgba(255,255,255,0.12)';

export default function LoginScreen() {
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  // Animations
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();

    // Pulsing rings
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.15, duration: 2000, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1,    duration: 2000,         useNativeDriver: true }),
        ])
      ).start();

    pulse(pulse1, 0);
    pulse(pulse2, 600);
    pulse(pulse3, 1200);
  }, []);

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
    <View style={styles.root}>
      {/* Gradient-like background layers */}
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      {/* Wave decoration at top */}
      <View style={styles.waveTop} />

      {/* Subtle grid lines */}
      {[...Array(8)].map((_, i) => (
        <View key={i} style={[styles.gridLine, { top: `${12 * (i + 1)}%` as any }]} />
      ))}

      <SafeAreaView style={styles.safe}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.ddlaLogo}>
            <Text style={styles.ddlaLogoText}>DDLA</Text>
          </View>
          <View style={styles.topBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Rəsmi Platforma</Text>
          </View>
        </View>

        {/* Center — anchor + rings */}
        <Animated.View style={[styles.center, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Pulsing rings */}
          <View style={styles.ringsWrap}>
            <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: pulse3 }] }]} />
            <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: pulse2 }] }]} />
            <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: pulse1 }] }]} />

            {/* Anchor core */}
            <View style={styles.anchorCore}>
              <Text style={styles.anchorEmoji}>⚓</Text>
            </View>
          </View>

          {/* Brand name */}
          <View style={styles.brandBlock}>
            <Text style={styles.brandMy}>My</Text>
            <Text style={styles.brandCabinet}>Cabinet</Text>
          </View>

          <Text style={styles.tagline}>Dənizçi Şəxsi Kabineti</Text>

          {/* Feature pills */}
          <View style={styles.featRow}>
            {['Sertifikatlar', 'Təlimlər', 'Xidmətlər'].map(f => (
              <View key={f} style={styles.featPill}>
                <Text style={styles.featText}>{f}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Bottom section */}
        <Animated.View style={[styles.bottom, { opacity: fadeIn }]}>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>daxil olmaq üçün</Text>
            <View style={styles.divLine} />
          </View>

          {/* MyGov button */}
          <TouchableOpacity
            style={styles.mygovBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <View style={styles.mygovInner}>
              {loading ? (
                <ActivityIndicator color={BG} size="small" />
              ) : (
                <>
                  {/* myGov emblem */}
                  <View style={styles.mygovEmblem}>
                    <Text style={styles.mygovEmblemText}>myGov</Text>
                  </View>
                  <View style={styles.mygovTextBlock}>
                    <Text style={styles.mygovLabel}>myGov ID ilə</Text>
                    <Text style={styles.mygovSub}>daxil ol</Text>
                  </View>
                  <View style={styles.mygovArrow}>
                    <Text style={styles.mygovArrowText}>›</Text>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              Azərbaycan Respublikası
            </Text>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>
              Dövlət Dəniz və Liman Agentliyi
            </Text>
          </View>

          <Text style={styles.footer}>© 2026 DDLA. Bütün hüquqlar qorunur.</Text>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },

  // Background decorations
  bgGlow1: {
    position: 'absolute',
    width: 320, height: 320,
    borderRadius: 160,
    backgroundColor: BLUE,
    opacity: 0.07,
    top: -60, left: -80,
  },
  bgGlow2: {
    position: 'absolute',
    width: 280, height: 280,
    borderRadius: 140,
    backgroundColor: TEAL,
    opacity: 0.06,
    bottom: 80, right: -60,
  },
  waveTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: TEAL,
    opacity: 0.6,
  },
  gridLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(0,212,200,0.04)',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  ddlaLogo: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: TEAL,
    backgroundColor: 'rgba(0,212,200,0.08)',
  },
  ddlaLogoText: {
    color: TEAL,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.2)',
    backgroundColor: 'rgba(0,212,200,0.04)',
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 1, shadowRadius: 4,
  },
  liveText: {
    color: TEAL,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Center
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  // Rings
  ringsWrap: {
    width: 180, height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ring3: {
    width: 170, height: 170,
    borderColor: 'rgba(0,212,200,0.08)',
    backgroundColor: 'rgba(0,212,200,0.02)',
  },
  ring2: {
    width: 130, height: 130,
    borderColor: 'rgba(0,212,200,0.15)',
    backgroundColor: 'rgba(0,212,200,0.04)',
  },
  ring1: {
    width: 95, height: 95,
    borderColor: 'rgba(0,212,200,0.35)',
    backgroundColor: 'rgba(0,212,200,0.08)',
  },
  anchorCore: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  anchorEmoji: { fontSize: 28 },

  // Brand
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  brandMy: {
    color: TEAL,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  brandCabinet: {
    color: WHITE,
    fontSize: 42,
    fontWeight: '300',
    letterSpacing: -1,
  },
  tagline: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Feature pills
  featRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  featPill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.2)',
    backgroundColor: 'rgba(0,212,200,0.06)',
  },
  featText: {
    color: TEAL,
    fontSize: 11,
    fontWeight: '600',
  },

  // Bottom
  bottom: {
    paddingHorizontal: 24,
    gap: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divLine: {
    flex: 1, height: 1,
    backgroundColor: MUTED2,
  },
  divText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '500',
  },

  // myGov button
  mygovBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: BLUE,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  mygovInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0057B7',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minHeight: 72,
  },
  mygovEmblem: {
    width: 44, height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mygovEmblemText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mygovTextBlock: { flex: 1 },
  mygovLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  mygovSub: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 1,
  },
  mygovArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mygovArrowText: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 24,
  },

  // Info
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  infoText: {
    color: MUTED,
    fontSize: 11,
    textAlign: 'center',
  },
  infoDot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: MUTED,
  },
  footer: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    textAlign: 'center',
    paddingBottom: 4,
  },
});
