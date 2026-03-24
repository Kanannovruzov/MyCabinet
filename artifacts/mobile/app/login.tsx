import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, Animated, Dimensions,
  TextInput, Alert, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { api } from '@/services/api';

const LOGIN_URL = 'https://seafarer.ddla.gov.az/login?mobile=1';

const BG     = '#040C1A';
const TEAL   = '#00D4C8';
const BLUE   = '#0057B7';
const WHITE  = '#FFFFFF';
const MUTED  = 'rgba(255,255,255,0.45)';
const MUTED2 = 'rgba(255,255,255,0.12)';
const RED    = '#EF4444';

export default function LoginScreen() {
  const { setAuth } = useAuth();
  const [loading, setLoading]       = useState(false);
  const [finMode, setFinMode]       = useState(false);
  const [fin, setFin]               = useState('');
  const [finLoading, setFinLoading] = useState(false);
  const [finError, setFinError]     = useState('');

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const pulse1  = useRef(new Animated.Value(1)).current;
  const pulse2  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    const pulseFn = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.12, duration: 2200, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1,    duration: 2200,        useNativeDriver: true }),
        ])
      ).start();
    pulseFn(pulse1, 0);
    pulseFn(pulse2, 700);
  }, []);

  const handleDeepLink = (url: string) => {
    const parsed = Linking.parse(url);
    if (parsed.path === 'auth') {
      const session = parsed.queryParams?.session as string | undefined;
      const pin     = parsed.queryParams?.pin     as string | undefined;
      const nameAz  = parsed.queryParams?.name_az as string | undefined;
      const nameEn  = parsed.queryParams?.name_en as string | undefined;
      if (session && pin) {
        setAuth(pin, { session, nameAz, nameEn });
        router.replace('/(tabs)');
      }
    }
  };

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });
    return () => sub.remove();
  }, []);

  const handleMyGovLogin = async () => {
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

  const handleFinLogin = async () => {
    const trimmed = fin.trim().toUpperCase();
    if (!trimmed) {
      setFinError('FIN kodunu daxil edin');
      return;
    }
    if (trimmed.length < 5) {
      setFinError('FIN kodu düzgün deyil');
      return;
    }

    setFinLoading(true);
    setFinError('');
    try {
      const res = await api.checkFin(trimmed);
      if (res.ok) {
        const userPin = res.pin ?? trimmed;
        setAuth(userPin, {
          nameAz: res.name_az,
          nameEn: res.name_en,
          seamanId: res.seaman_id,
          photoUrl: res.photo_url,
        });
        router.replace('/(tabs)');
      } else {
        setFinError(res.msg || 'Sizin kabinetiniz yoxdur. Zəhmət olmasa DDLA ilə əlaqə saxlayın.');
      }
    } catch {
      setFinError('Şəbəkə xətası. Yenidən cəhd edin.');
    } finally {
      setFinLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />
      <View style={styles.waveTop} />
      {[...Array(6)].map((_, i) => (
        <View key={i} style={[styles.gridLine, { top: `${14 * (i + 1)}%` as any }]} />
      ))}

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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
              <View style={styles.ringsWrap}>
                <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: pulse2 }] }]} />
                <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: pulse1 }] }]} />
                <View style={styles.anchorCore}>
                  <Text style={styles.anchorEmoji}>⚓</Text>
                </View>
              </View>

              <View style={styles.brandBlock}>
                <Text style={styles.brandMy}>My</Text>
                <Text style={styles.brandCabinet}>Cabinet</Text>
              </View>
              <Text style={styles.tagline}>Dənizçi Şəxsi Kabineti</Text>

              <View style={styles.featRow}>
                {['Sertifikatlar', 'Təlimlər', 'Xidmətlər'].map(f => (
                  <View key={f} style={styles.featPill}>
                    <Text style={styles.featText}>{f}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Bottom — login buttons */}
            <Animated.View style={[styles.bottom, { opacity: fadeIn }]}>
              <View style={styles.divider}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>daxil olmaq üçün</Text>
                <View style={styles.divLine} />
              </View>

              {/* myGov button */}
              <TouchableOpacity
                style={styles.mygovBtn}
                onPress={handleMyGovLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <View style={styles.mygovInner}>
                  {loading ? (
                    <ActivityIndicator color={BG} size="small" />
                  ) : (
                    <>
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

              {/* OR divider */}
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>və ya</Text>
                <View style={styles.orLine} />
              </View>

              {/* FIN login */}
              {!finMode ? (
                <TouchableOpacity
                  style={styles.finBtnClosed}
                  onPress={() => setFinMode(true)}
                  activeOpacity={0.85}
                >
                  <View style={styles.finIcon}>
                    <Text style={styles.finIconText}>FIN</Text>
                  </View>
                  <View style={styles.finClosedTextBlock}>
                    <Text style={styles.finClosedLabel}>FIN kodu ilə</Text>
                    <Text style={styles.finClosedSub}>daxil ol</Text>
                  </View>
                  <View style={styles.mygovArrow}>
                    <Text style={[styles.mygovArrowText, { color: TEAL }]}>›</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.finPanel}>
                  <View style={styles.finPanelHeader}>
                    <View style={styles.finIcon}>
                      <Text style={styles.finIconText}>FIN</Text>
                    </View>
                    <Text style={styles.finPanelTitle}>FIN kodu ilə daxil ol</Text>
                  </View>

                  <View style={styles.finInputWrap}>
                    <TextInput
                      style={styles.finInput}
                      placeholder="FIN kodunuzu daxil edin"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={fin}
                      onChangeText={(t) => { setFin(t); setFinError(''); }}
                      autoCapitalize="characters"
                      maxLength={10}
                      autoCorrect={false}
                      returnKeyType="go"
                      onSubmitEditing={handleFinLogin}
                    />
                  </View>

                  {!!finError && (
                    <View style={styles.finErrorBox}>
                      <Text style={styles.finErrorText}>{finError}</Text>
                    </View>
                  )}

                  <View style={styles.finActions}>
                    <TouchableOpacity
                      style={styles.finCancelBtn}
                      onPress={() => { setFinMode(false); setFin(''); setFinError(''); }}
                    >
                      <Text style={styles.finCancelText}>Ləğv et</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.finSubmitBtn, finLoading && styles.finSubmitDisabled]}
                      onPress={handleFinLogin}
                      disabled={finLoading}
                      activeOpacity={0.85}
                    >
                      {finLoading ? (
                        <ActivityIndicator color={BG} size="small" />
                      ) : (
                        <Text style={styles.finSubmitText}>Daxil ol</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Info */}
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Azərbaycan Respublikası</Text>
                <View style={styles.infoDot} />
                <Text style={styles.infoText}>Dövlət Dəniz və Liman Agentliyi</Text>
              </View>
              <Text style={styles.footer}>© 2026 DDLA. Bütün hüquqlar qorunur.</Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, overflow: 'hidden' },
  safe: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },

  bgGlow1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: BLUE, opacity: 0.07, top: -60, left: -80,
  },
  bgGlow2: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: TEAL, opacity: 0.06, bottom: 80, right: -60,
  },
  waveTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    backgroundColor: TEAL, opacity: 0.6,
  },
  gridLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(0,212,200,0.04)',
  },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 8,
  },
  ddlaLogo: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1.5, borderColor: TEAL, backgroundColor: 'rgba(0,212,200,0.08)',
  },
  ddlaLogoText: { color: TEAL, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  topBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.2)', backgroundColor: 'rgba(0,212,200,0.04)',
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 1, shadowRadius: 4,
  },
  liveText: { color: TEAL, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },

  ringsWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  ring2: {
    width: 150, height: 150,
    borderColor: 'rgba(0,212,200,0.1)', backgroundColor: 'rgba(0,212,200,0.03)',
  },
  ring1: {
    width: 110, height: 110,
    borderColor: 'rgba(0,212,200,0.25)', backgroundColor: 'rgba(0,212,200,0.06)',
  },
  anchorCore: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: TEAL, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  anchorEmoji: { fontSize: 26 },

  brandBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  brandMy: { color: TEAL, fontSize: 38, fontWeight: '800', letterSpacing: -1 },
  brandCabinet: { color: WHITE, fontSize: 38, fontWeight: '300', letterSpacing: -1 },
  tagline: { color: MUTED, fontSize: 13, fontWeight: '500', letterSpacing: 0.5, textAlign: 'center' },

  featRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  featPill: {
    paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.2)', backgroundColor: 'rgba(0,212,200,0.06)',
  },
  featText: { color: TEAL, fontSize: 10, fontWeight: '600' },

  bottom: { paddingHorizontal: 24, gap: 12 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: MUTED2 },
  divText: { color: MUTED, fontSize: 12, fontWeight: '500' },

  mygovBtn: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: BLUE, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  mygovInner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: BLUE,
    paddingVertical: 16, paddingHorizontal: 18, gap: 14, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', minHeight: 68,
  },
  mygovEmblem: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  mygovEmblemText: { color: WHITE, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  mygovTextBlock: { flex: 1 },
  mygovLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500' },
  mygovSub: { color: WHITE, fontSize: 17, fontWeight: '700', marginTop: 1 },
  mygovArrow: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  mygovArrowText: { color: WHITE, fontSize: 20, fontWeight: '300', lineHeight: 22 },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  orText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '500' },

  finBtnClosed: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 18, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.25)',
    backgroundColor: 'rgba(0,212,200,0.06)',
  },
  finIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: 'rgba(0,212,200,0.12)', borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  finIconText: { color: TEAL, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  finClosedTextBlock: { flex: 1 },
  finClosedLabel: { color: MUTED, fontSize: 12, fontWeight: '500' },
  finClosedSub: { color: TEAL, fontSize: 17, fontWeight: '700', marginTop: 1 },

  finPanel: {
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,212,200,0.25)',
    backgroundColor: 'rgba(0,212,200,0.04)', padding: 18, gap: 14,
  },
  finPanelHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  finPanelTitle: { color: TEAL, fontSize: 15, fontWeight: '700' },
  finInputWrap: {
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,212,200,0.2)',
    backgroundColor: 'rgba(0,0,0,0.3)', overflow: 'hidden',
  },
  finInput: {
    color: WHITE, fontSize: 16, fontWeight: '600',
    paddingHorizontal: 16, paddingVertical: 14,
    letterSpacing: 1,
  },
  finErrorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    padding: 12,
  },
  finErrorText: { color: RED, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  finActions: { flexDirection: 'row', gap: 10 },
  finCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  finCancelText: { color: MUTED, fontSize: 14, fontWeight: '600' },
  finSubmitBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 14,
    backgroundColor: TEAL, alignItems: 'center',
    shadowColor: TEAL, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  finSubmitDisabled: { opacity: 0.6 },
  finSubmitText: { color: BG, fontSize: 15, fontWeight: '700' },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, flexWrap: 'wrap', marginTop: 4,
  },
  infoText: { color: MUTED, fontSize: 11, textAlign: 'center' },
  infoDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: MUTED },
  footer: { color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', paddingBottom: 4 },
});
