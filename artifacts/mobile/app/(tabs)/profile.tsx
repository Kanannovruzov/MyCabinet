import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import { api, ProfileItem } from '@/services/api';
import OceanWaves from '@/components/ocean-waves';

function PulsingDot({ bgColor }: { bgColor: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 2.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <View style={pStyles.onlineDotWrap}>
      <Animated.View style={[pStyles.onlinePulse, { transform: [{ scale }], opacity }]} />
      <View style={[pStyles.onlineDot, { borderColor: bgColor }]} />
    </View>
  );
}

const pStyles = StyleSheet.create({
  onlineDotWrap: {
    position: 'absolute', bottom: 4, right: 4,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  onlinePulse: {
    position: 'absolute',
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#22C55E',
  },
  onlineDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
  },
});

export default function ProfileScreen() {
  const { pin, nameAz, nameEn, photoUrl, clearAuth } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<ProfileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(photoUrl);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const C = colors;

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.profile();
      if (res.ok && res.item) {
        setProfile(res.item);
        const id = res.item.unikal || res.item.colID;
        if (id) setUserPhoto(`https://seafarer.ddla.gov.az/image/${id}`);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const handleLogout = () => {
    Alert.alert(
      'Çıxış',
      'Hesabdan çıxmaq istədiyinizə əminsiniz?',
      [
        { text: 'Ləğv et', style: 'cancel' },
        { text: 'Çıx', style: 'destructive', onPress: () => { clearAuth(); router.replace('/login'); } },
      ]
    );
  };

  const profileNameAz = profile?.name_azD || profile?.name_az;
  const profileNameEn = profile?.name_enD || profile?.name_en;
  const displayName = nameAz || profileNameAz || `PIN: ${pin}`;
  const initials = (displayName || '??')
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: C.bg }]}>  
        <ActivityIndicator color={C.teal} size="large" />
      </SafeAreaView>
    );
  }

  const p = profile as any;
  const position = p?.crew || 'Dənizçi';
  const seamanId = p?.seaman_id || pin || '---';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.bgGlow1, { backgroundColor: C.teal }]} />
      <View style={[styles.bgGlow2, { backgroundColor: C.blue }]} />
      <OceanWaves color={C.teal} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.teal} />
          }
        >
          <View style={styles.topActions}>
            <TouchableOpacity
              style={[styles.settingsBtn, { backgroundColor: C.glass, borderColor: C.glassBorder }]}
              onPress={() => router.push('/settings')}
            >
              <Feather name="settings" size={20} color={C.teal} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarOuter}>
              <View style={[styles.avatarRing, { borderColor: C.teal }]}>
                {userPhoto ? (
                  <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: C.teal + '12' }]}>
                    <Text style={[styles.avatarText, { color: C.teal }]}>{initials}</Text>
                  </View>
                )}
              </View>
              <PulsingDot bgColor={C.bg} />
            </View>

            <Text style={[styles.profileName, { color: C.text }]}>{displayName}</Text>
            <Text style={[styles.profileRole, { color: C.teal }]}>{position}</Text>

            <View style={styles.badgeRow}>
              <View style={[styles.tealPill, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
                <Feather name="hash" size={10} color={C.teal} />
                <Text style={[styles.pillText, { color: C.teal }]}>ID: {seamanId}</Text>
              </View>
              <View style={[styles.tealPill, { borderColor: 'rgba(34,197,94,0.3)', backgroundColor: 'rgba(34,197,94,0.06)' }]}>
                <View style={[styles.pillDot, { backgroundColor: C.green }]} />
                <Text style={[styles.pillText, { color: C.green }]}>Aktiv</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]} onPress={() => router.push('/documents')}>
              <View style={[styles.actionIconBg, { backgroundColor: C.teal + '12' }]}>
                <Feather name="file-text" size={18} color={C.teal} />
              </View>
              <Text style={[styles.actionLabel, { color: C.muted }]}>Sənədlər</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]} onPress={() => router.push('/notifications')}>
              <View style={[styles.actionIconBg, { backgroundColor: '#EAB308' + '12' }]}>
                <Feather name="bell" size={18} color="#EAB308" />
              </View>
              <Text style={[styles.actionLabel, { color: C.muted }]}>Bildirişlər</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]} onPress={() => router.push('/feedback')}>
              <View style={[styles.actionIconBg, { backgroundColor: C.blue + '12' }]}>
                <Feather name="mail" size={18} color={C.blue} />
              </View>
              <Text style={[styles.actionLabel, { color: C.muted }]}>Müraciət</Text>
            </TouchableOpacity>
          </View>

          {p ? (
            <>
              <SectionCard title="Şəxsi məlumatlar" icon="user" colors={C}>
                <InfoRow label="Cins" value={p.gender} colors={C} />
                <InfoRow label="Doğum tarixi" value={p.dob} colors={C} />
                <InfoRow label="FIN" value={p.fin || pin} colors={C} last />
              </SectionCard>
              <SectionCard title="Əlaqə" icon="phone" colors={C}>
                <InfoRow label="Email" value={p.email} colors={C} />
                <InfoRow label="Telefon 1" value={p.phone1} colors={C} />
                <InfoRow label="Telefon 2" value={p.phone2} colors={C} last />
              </SectionCard>
              <SectionCard title="Dənizçi məlumatları" icon="anchor" colors={C}>
                <InfoRow label="Müəssisə" value={p.org} colors={C} />
                <InfoRow label="Şəhadətnamə" value={p.seaman_id} colors={C} />
                <InfoRow label="Verilmə" value={p.seaman_issue} colors={C} />
                <InfoRow label="Etibarlılıq" value={p.seaman_valid} colors={C} last />
              </SectionCard>
            </>
          ) : (
            <View style={styles.noProfileBox}>
              <Feather name="clipboard" size={32} color={C.muted} />
              <Text style={[styles.noProfileText, { color: C.muted }]}>Profil məlumatları bazadan yüklənir</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.settingsRow, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}
            onPress={() => router.push('/settings')}
          >
            <View style={[styles.settingsRowIcon, { backgroundColor: C.teal + '12' }]}>
              <Feather name="settings" size={18} color={C.teal} />
            </View>
            <Text style={[styles.settingsRowText, { color: C.text }]}>Tənzimləmələr</Text>
            <Feather name="chevron-right" size={18} color={C.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Çıxış et</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors: C, last }: { label: string; value: string | null | undefined; colors: any; last?: boolean }) {
  if (!value) return null;
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: C.divider }]}>
      <Text style={[styles.infoLabel, { color: C.muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: C.text }]}>{value}</Text>
    </View>
  );
}

function SectionCard({ title, icon, colors: C, children }: { title: string; icon: string; colors: any; children: React.ReactNode }) {
  return (
    <View style={[styles.section]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionLine, { backgroundColor: C.divider }]} />
        <View style={styles.sectionBadge}>
          <Feather name={icon as any} size={12} color={C.teal} />
          <Text style={[styles.sectionTitle, { color: C.teal }]}>{title}</Text>
        </View>
        <View style={[styles.sectionLine, { backgroundColor: C.divider }]} />
      </View>
      <View style={[styles.sectionCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  bgGlow1: {
    position: 'absolute', top: -60, right: -40,
    width: 200, height: 200, borderRadius: 100, opacity: 0.04,
  },
  bgGlow2: {
    position: 'absolute', bottom: 100, left: -30,
    width: 160, height: 160, borderRadius: 80, opacity: 0.05,
  },
  topActions: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 20, paddingTop: 10,
  },
  settingsBtn: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 10, paddingBottom: 20, gap: 6,
  },
  avatarOuter: { position: 'relative', marginBottom: 8 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, overflow: 'hidden',
    backgroundColor: 'rgba(0,212,200,0.08)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#00d4c8', shadowOpacity: 0.3, shadowRadius: 12,
  },
  avatarImage: { width: 94, height: 94, borderRadius: 47 },
  avatarFallback: {
    width: 94, height: 94, borderRadius: 47,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '800' },
  profileName: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  profileRole: { fontSize: 13, fontWeight: '500' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: '700' },
  quickActions: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20,
  },
  actionBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    paddingVertical: 14, alignItems: 'center', gap: 8,
  },
  actionIconBg: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 18 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  sectionCard: {
    borderRadius: 16, borderWidth: 1, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  infoLabel: { fontSize: 12, fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },
  noProfileBox: { padding: 30, alignItems: 'center', gap: 8 },
  noProfileText: { fontSize: 14, textAlign: 'center' },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginBottom: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1,
  },
  settingsRowIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingsRowText: { flex: 1, fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 4,
    paddingVertical: 16, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
