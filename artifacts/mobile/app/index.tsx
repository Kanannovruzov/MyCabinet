import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';

const { width, height } = Dimensions.get('window');
const BG   = '#040C1A';
const TEAL = '#00D4C8';
const BLUE = '#0057B7';

function Wave({ delay, y, opacity: baseOp }: { delay: number; y: number; opacity: number }) {
  const translateX = useRef(new Animated.Value(-width)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, { toValue: width, duration: 6000, delay, useNativeDriver: true })
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.wave, { top: y, opacity: baseOp, transform: [{ translateX }] }]}>
      <View style={styles.waveLine} />
    </Animated.View>
  );
}

export default function SplashScreen() {
  const { session, pin } = useAuth();
  const logoScale  = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.2)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ring2Scale  = useRef(new Animated.Value(0.2)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const glowPulse  = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.15, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.05, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,  { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ringScale,   { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ring2Scale,   { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ring2Opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(700),
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

      <Wave delay={0} y={height * 0.15} opacity={0.08} />
      <Wave delay={1500} y={height * 0.35} opacity={0.06} />
      <Wave delay={3000} y={height * 0.55} opacity={0.04} />
      <Wave delay={800} y={height * 0.75} opacity={0.07} />
      <Wave delay={2200} y={height * 0.9} opacity={0.05} />

      <Animated.View style={[styles.outerRing2, { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] }]} />
      <Animated.View style={[styles.outerRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />

      <Animated.View style={[styles.glowCircle, { opacity: glowPulse }]} />

      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image source={require('@/assets/images/ddla-logo.png')} style={styles.logoImg} />
      </Animated.View>

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
    backgroundColor: BLUE,
    opacity: 0.1,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -60, right: -40,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: TEAL,
    opacity: 0.08,
  },

  wave: { position: 'absolute', left: 0, width: width * 2, height: 2 },
  waveLine: {
    width: '100%', height: 2, borderRadius: 1,
    backgroundColor: TEAL,
  },

  outerRing2: {
    position: 'absolute',
    width: 240, height: 240, borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.08)',
    backgroundColor: 'rgba(0,212,200,0.02)',
  },
  outerRing: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.15)',
    backgroundColor: 'rgba(0,212,200,0.04)',
  },
  glowCircle: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: TEAL,
  },

  logoWrap: {
    marginBottom: 28,
    width: 120, height: 120, borderRadius: 60,
    overflow: 'hidden',
    shadowColor: TEAL,
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15,
  },
  logoImg: {
    width: 120, height: 120,
  },

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
