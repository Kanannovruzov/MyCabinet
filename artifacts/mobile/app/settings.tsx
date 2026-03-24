import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  TouchableOpacity, Switch, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '@/context/theme';
import OceanWaves from '@/components/ocean-waves';

export default function SettingsScreen() {
  const { isDark, colors, toggleTheme, biometricEnabled, setBiometricEnabled } = useTheme();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);

    if (compatible) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Üz tanıma');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Barmaq izi');
      } else {
        setBiometricType('Biometrik');
      }
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Biometrik girişi aktivləşdirin',
        cancelLabel: 'Ləğv et',
        disableDeviceFallback: false,
      });
      if (result.success) {
        setBiometricEnabled(true);
      } else {
        Alert.alert('Xəta', 'Biometrik doğrulama uğursuz oldu');
      }
    } else {
      setBiometricEnabled(false);
    }
  };

  const C = colors;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>  
      <View style={[styles.bgGlow1, { backgroundColor: C.teal }]} />
      <View style={[styles.bgGlow2, { backgroundColor: C.blue }]} />
      <OceanWaves color={C.teal} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={[styles.topbar, { borderBottomColor: C.divider }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={C.teal} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: C.text }]}>Tənzimləmələr</Text>
            <Text style={[styles.pageSubtitle, { color: C.muted }]}>Proqram parametrləri</Text>
          </View>
          <View style={[styles.tealPill, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
            <Feather name="settings" size={12} color={C.teal} />
            <Text style={[styles.pillText, { color: C.teal }]}>v1.0</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={[styles.sectionCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: C.teal + '15' }]}>
                <Feather name="shield" size={16} color={C.teal} />
              </View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Təhlükəsizlik</Text>
            </View>

            <View style={[styles.settingRow, { borderBottomColor: C.divider }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBg, { backgroundColor: C.teal + '12' }]}>
                  <MaterialIcons
                    name={biometricType === 'Üz tanıma' ? 'face' : 'fingerprint'}
                    size={20}
                    color={C.teal}
                  />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: C.text }]}>
                    {biometricType || 'Biometrik giriş'}
                  </Text>
                  <Text style={[styles.settingDesc, { color: C.muted }]}>
                    {biometricAvailable
                      ? 'Tətbiqə daxil olmaq üçün istifadə edin'
                      : 'Bu cihazda dəstəklənmir'}
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={!biometricAvailable}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: C.teal + '60' }}
                thumbColor={biometricEnabled ? C.teal : '#666'}
                ios_backgroundColor="rgba(255,255,255,0.1)"
              />
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: isDark ? '#EAB308' + '15' : C.blue + '15' }]}>
                <Feather name={isDark ? 'moon' : 'sun'} size={16} color={isDark ? '#EAB308' : C.blue} />
              </View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Görünüş</Text>
            </View>

            <View style={[styles.settingRow, { borderBottomColor: 'transparent' }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBg, { backgroundColor: isDark ? '#EAB308' + '12' : C.blue + '12' }]}>
                  <Feather name={isDark ? 'moon' : 'sun'} size={20} color={isDark ? '#EAB308' : C.blue} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: C.text }]}>
                    {isDark ? 'Gecə rejimi' : 'Gündüz rejimi'}
                  </Text>
                  <Text style={[styles.settingDesc, { color: C.muted }]}>
                    {isDark ? 'Qaranlıq tema aktivdir' : 'İşıqlı tema aktivdir'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: '#EAB308' + '60' }}
                thumbColor={isDark ? '#EAB308' : C.blue}
                ios_backgroundColor="rgba(0,0,0,0.1)"
              />
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: C.blue + '15' }]}>
                <Feather name="info" size={16} color={C.blue} />
              </View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Haqqında</Text>
            </View>

            <View style={[styles.infoRow, { borderBottomColor: C.divider }]}>
              <Text style={[styles.infoLabel, { color: C.muted }]}>Tətbiq</Text>
              <Text style={[styles.infoValue, { color: C.text }]}>DDLA MyCabinet</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: C.divider }]}>
              <Text style={[styles.infoLabel, { color: C.muted }]}>Versiya</Text>
              <Text style={[styles.infoValue, { color: C.text }]}>1.0.0</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: 'transparent' }]}>
              <Text style={[styles.infoLabel, { color: C.muted }]}>Tərtibatçı</Text>
              <Text style={[styles.infoValue, { color: C.text }]}>DDLA</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgGlow1: {
    position: 'absolute', top: -60, right: -40,
    width: 200, height: 200, borderRadius: 100, opacity: 0.04,
  },
  bgGlow2: {
    position: 'absolute', bottom: 100, left: -30,
    width: 160, height: 160, borderRadius: 80, opacity: 0.05,
  },
  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, gap: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,212,200,0.08)',
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.15)',
  },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  pageSubtitle: { fontSize: 12, marginTop: 2 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  content: { padding: 20, gap: 16 },
  sectionCard: {
    borderRadius: 18, borderWidth: 1, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
  },
  sectionIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 },
  settingIconBg: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingDesc: { fontSize: 11, marginTop: 2 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 12, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '600' },
});
