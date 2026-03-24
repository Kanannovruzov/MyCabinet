import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  TouchableOpacity, Switch, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '@/context/theme';
import OceanWaves from '@/components/ocean-waves';

function PinModal({
  visible,
  onClose,
  onConfirm,
  colors: C,
  mode,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  colors: any;
  mode: 'set' | 'change';
}) {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('enter');
      setPin('');
      setConfirmPin('');
      setError('');
    }
  }, [visible]);

  const handleDigit = (d: string) => {
    setError('');
    if (step === 'enter') {
      const next = pin + d;
      setPin(next);
      if (next.length === 4) {
        setTimeout(() => setStep('confirm'), 200);
      }
    } else {
      const next = confirmPin + d;
      setConfirmPin(next);
      if (next.length === 4) {
        if (next === pin) {
          onConfirm(next);
        } else {
          setError('Parollar uyğun gəlmir');
          setConfirmPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    setError('');
    if (step === 'enter') {
      setPin(p => p.slice(0, -1));
    } else {
      setConfirmPin(p => p.slice(0, -1));
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[pinStyles.overlay, { backgroundColor: C.bg + 'f0' }]}>
        <SafeAreaView style={pinStyles.safe}>
          <View style={pinStyles.header}>
            <TouchableOpacity onPress={onClose} style={[pinStyles.closeBtn, { backgroundColor: C.glass, borderColor: C.glassBorder }]}>
              <Feather name="x" size={20} color={C.teal} />
            </TouchableOpacity>
          </View>

          <View style={pinStyles.center}>
            <View style={[pinStyles.lockIcon, { backgroundColor: C.teal + '12', borderColor: C.teal + '30' }]}>
              <Feather name="lock" size={28} color={C.teal} />
            </View>
            <Text style={[pinStyles.title, { color: C.text }]}>
              {step === 'enter'
                ? (mode === 'set' ? 'Parol təyin edin' : 'Yeni parol daxil edin')
                : 'Parolu təsdiqləyin'}
            </Text>
            <Text style={[pinStyles.sub, { color: C.muted }]}>4 rəqəmli parol daxil edin</Text>

            <View style={pinStyles.dots}>
              {[0, 1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    pinStyles.dot,
                    { borderColor: C.teal + '40' },
                    i < currentPin.length && { backgroundColor: C.teal, borderColor: C.teal },
                  ]}
                />
              ))}
            </View>

            {!!error && (
              <Text style={[pinStyles.error, { color: C.red }]}>{error}</Text>
            )}

            <View style={pinStyles.numpad}>
              {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'del']].map((row, ri) => (
                <View key={ri} style={pinStyles.numRow}>
                  {row.map((d, di) => {
                    if (d === '') return <View key={di} style={pinStyles.numBtn} />;
                    if (d === 'del') {
                      return (
                        <TouchableOpacity key={di} style={pinStyles.numBtn} onPress={handleDelete}>
                          <Feather name="delete" size={22} color={C.muted} />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={di}
                        style={[pinStyles.numBtn, { backgroundColor: C.glass, borderColor: C.glassBorder }]}
                        onPress={() => handleDigit(d)}
                        activeOpacity={0.6}
                      >
                        <Text style={[pinStyles.numText, { color: C.text }]}>{d}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const {
    isDark, colors, toggleTheme,
    biometricEnabled, setBiometricEnabled,
    pinEnabled, setPinEnabled, appPin, setAppPin,
  } = useTheme();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [biometricIcon, setBiometricIcon] = useState<'face' | 'fingerprint'>('fingerprint');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<'set' | 'change'>('set');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const C = colors;

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
        setBiometricIcon('face');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Barmaq izi');
        setBiometricIcon('fingerprint');
      } else {
        setBiometricType('Biometrik');
        setBiometricIcon('fingerprint');
      }
    } else {
      setBiometricType('Biometrik');
      setBiometricIcon('fingerprint');
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

  const handlePinToggle = (value: boolean) => {
    if (value) {
      setPinMode('set');
      setShowPinModal(true);
    } else {
      Alert.alert(
        'Parolu söndür',
        'Parol kilidi söndürülsün?',
        [
          { text: 'Ləğv et', style: 'cancel' },
          {
            text: 'Söndür', style: 'destructive',
            onPress: () => { setPinEnabled(false); setAppPin(null); },
          },
        ]
      );
    }
  };

  const handlePinConfirm = (pin: string) => {
    setAppPin(pin);
    setPinEnabled(true);
    setShowPinModal(false);
    Alert.alert('Hazırdır', 'Parol uğurla təyin edildi');
  };

  const handleChangePin = () => {
    setPinMode('change');
    setShowPinModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.bgGlow1, { backgroundColor: C.teal }]} />
      <View style={[styles.bgGlow2, { backgroundColor: C.blue }]} />
      <OceanWaves color={C.teal} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={[styles.topbar, { borderBottomColor: C.divider }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.glass, borderColor: C.glassBorder }]}>
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
                <View style={[styles.settingIconBg, { backgroundColor: C.blue + '12' }]}>
                  <Feather name="lock" size={20} color={C.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: C.text }]}>Parol kilidi</Text>
                  <Text style={[styles.settingDesc, { color: C.muted }]}>
                    {pinEnabled ? '4 rəqəmli parol aktivdir' : 'Tətbiqə giriş üçün parol təyin edin'}
                  </Text>
                </View>
              </View>
              <View style={styles.settingRight}>
                {pinEnabled && (
                  <TouchableOpacity
                    onPress={handleChangePin}
                    style={[styles.changePinBtn, { borderColor: C.blue + '40', backgroundColor: C.blue + '10' }]}
                  >
                    <Text style={[styles.changePinText, { color: C.blue }]}>Dəyiş</Text>
                  </TouchableOpacity>
                )}
                <Switch
                  value={pinEnabled}
                  onValueChange={handlePinToggle}
                  trackColor={{ false: C.inputBg, true: C.blue + '60' }}
                  thumbColor={pinEnabled ? C.blue : '#666'}
                  ios_backgroundColor={C.inputBg}
                />
              </View>
            </View>

            <View style={[styles.settingRow, { borderBottomColor: 'transparent' }]}>
              <View style={styles.settingLeft}>
                <View style={[
                  styles.settingIconBg,
                  { backgroundColor: biometricAvailable ? C.teal + '12' : C.muted + '10' },
                ]}>
                  <MaterialIcons
                    name={biometricIcon}
                    size={20}
                    color={biometricAvailable ? C.teal : C.muted + '60'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.settingLabel,
                    { color: biometricAvailable ? C.text : C.muted + '80' },
                  ]}>
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
                trackColor={{ false: C.inputBg, true: C.teal + '60' }}
                thumbColor={biometricEnabled ? C.teal : biometricAvailable ? '#666' : '#444'}
                ios_backgroundColor={C.inputBg}
                style={!biometricAvailable ? { opacity: 0.4 } : undefined}
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

      <PinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handlePinConfirm}
        colors={C}
        mode={pinMode}
      />
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
    borderWidth: 1,
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
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingIconBg: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingDesc: { fontSize: 11, marginTop: 2 },
  changePinBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1,
  },
  changePinText: { fontSize: 11, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 12, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '600' },
});

const pinStyles = StyleSheet.create({
  overlay: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 20, paddingTop: 10,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  lockIcon: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  sub: { fontSize: 13, marginBottom: 30 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2,
  },
  error: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: -8 },
  numpad: { marginTop: 30, gap: 12 },
  numRow: { flexDirection: 'row', gap: 20 },
  numBtn: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'transparent',
  },
  numText: { fontSize: 28, fontWeight: '500' },
});
