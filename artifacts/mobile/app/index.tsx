import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';

const { width, height } = Dimensions.get('window');
const BG   = '#040C1A';
const TEAL = '#00D4C8';

export default function SplashScreen() {
  const { session, pin } = useAuth();
  const logoScale  = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.3)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(ringScale,   { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(800),
    ]).start(() => {
      if (session && pin) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    });
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Pulsing ring */}
      <Animated.View style={[styles.outerRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.anchorCircle}>
          <Text style={styles.anchorEmoji}>⚓</Text>
        </View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
        <View style={styles.ddlaBadge}>
          <Text style={styles.ddlaBadgeText}>DDLA</Text>
        </View>
        <View style={styles.brandRow}>
          <Text style={styles.brandMy}>My</Text>
          <Text style={styles.brandCabinet}>Cabinet</Text>
        </View>
        <Text style={styles.subtitle}>Dənizçi Şəxsi Kabineti</Text>
        <Text style={styles.org}>Dövlət Dəniz və Liman Agentliyi</Text>
      </Animated.View>

      {/* Bottom line */}
      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowTop: {
    position: 'absolute',
    top: -100, left: -50,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#0057B7',
    opacity: 0.08,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -60, right: -40,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: TEAL,
    opacity: 0.06,
  },

  outerRing: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.15)',
    backgroundColor: 'rgba(0,212,200,0.03)',
  },

  logoWrap: {
    marginBottom: 28,
  },
  anchorCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  anchorEmoji: { fontSize: 44 },

  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  ddlaBadge: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: TEAL,
    backgroundColor: 'rgba(0,212,200,0.08)',
    marginBottom: 4,
  },
  ddlaBadgeText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  brandMy: {
    color: TEAL,
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1,
  },
  brandCabinet: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '300',
    letterSpacing: -1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  org: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
  },

  bottomLine: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: TEAL,
    opacity: 0.5,
  },
});
