import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { api, ProfileItem } from '@/services/api';

const BG    = '#060d1a';
const BG2   = '#0a1628';
const TEAL  = '#00d4c8';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.45)';
const RED   = '#EF4444';
const GREEN = '#22C55E';
const BLUE  = '#0057B7';

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <View style={styles.sectionBadge}>
          <Text style={{ fontSize: 12 }}>{icon}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionLine} />
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function ProfileScreen() {
  const { pin, nameAz, nameEn, photoUrl, clearAuth } = useAuth();
  const [profile, setProfile]       = useState<ProfileItem | null>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [userPhoto, setUserPhoto] = useState<string | null>(photoUrl);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.profile();
      if (res.ok && res.item) {
        setProfile(res.item);
        const id = res.item.unikal || res.item.colID;
        if (id) {
          setUserPhoto(`https://seafarer.ddla.gov.az/image/${id}`);
        }
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

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

  const pAdiAz = profile?.ADI_AZ || profile?.adi_az || '';
  const pSoyadiAz = profile?.SOYADI_AZ || profile?.soyadi_az || '';
  const pAdiEn = profile?.ADI || profile?.adi || '';
  const pSoyadiEn = profile?.SOYADI || profile?.soyadi || '';
  const profileNameAz = (pAdiAz && pSoyadiAz) ? `${pAdiAz} ${pSoyadiAz}` : profile?.name_az;
  const profileNameEn = (pAdiEn && pSoyadiEn) ? `${pAdiEn} ${pSoyadiEn}` : profile?.name_en;

  const displayName = nameAz || profileNameAz || `PIN: ${pin}`;
  const displayNameEn = nameEn || profileNameEn;
  const initials = (displayName || '??')
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={TEAL} size="large" />
      </SafeAreaView>
    );
  }

  const p = profile as any;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={TEAL} />
        }
      >
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarRing}>
              {userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </View>
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.profileName}>{displayName}</Text>
          {displayNameEn && <Text style={styles.profileNameEn}>{displayNameEn}</Text>}
          <Text style={styles.profileRole}>{p?.crew || 'Dənizçi'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.tealPill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>DDLA Üzvü</Text>
            </View>
            <View style={[styles.tealPill, { borderColor: 'rgba(34,197,94,0.3)', backgroundColor: 'rgba(34,197,94,0.06)' }]}>
              <View style={[styles.pillDot, { backgroundColor: GREEN }]} />
              <Text style={[styles.pillText, { color: GREEN }]}>Aktiv</Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/documents')}>
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionLabel}>Sənədlər</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/notifications')}>
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionLabel}>Bildirişlər</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/feedback')}>
            <Text style={styles.actionIcon}>✉️</Text>
            <Text style={styles.actionLabel}>Müraciət</Text>
          </TouchableOpacity>
        </View>

        {/* Profile info */}
        {p ? (
          <>
            <Section title="Şəxsi məlumatlar" icon="👤">
              <InfoRow label="Ad Soyad (AZ)" value={p.name_az} />
              <InfoRow label="Ad Soyad (EN)" value={p.name_en} />
              <InfoRow label="Cins" value={p.gender} />
              <InfoRow label="Doğum tarixi" value={p.dob} />
              <InfoRow label="FIN" value={p.fin || pin} />
              <InfoRow label="İnd. nömrəsi" value={p.ind_num} />
            </Section>
            <Section title="Əlaqə" icon="📞">
              <InfoRow label="Email" value={p.email} />
              <InfoRow label="Telefon 1" value={p.phone1} />
              <InfoRow label="Telefon 2" value={p.phone2} />
            </Section>
            <Section title="Dənizçi məlumatları" icon="⚓">
              <InfoRow label="Müəssisə" value={p.org} />
              <InfoRow label="Vəzifə" value={p.crew} />
              <InfoRow label="Şəhadətnamə" value={p.seaman_id} />
              <InfoRow label="Verilmə" value={p.seaman_issue} />
              <InfoRow label="Etibarlılıq" value={p.seaman_valid} />
            </Section>
          </>
        ) : (
          <View style={styles.noProfileBox}>
            <Text style={{ fontSize: 32 }}>📋</Text>
            <Text style={styles.noProfileText}>Profil məlumatları bazadan yüklənir</Text>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıxış et</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { alignItems: 'center', justifyContent: 'center' },

  bgGlow1: {
    position: 'absolute', top: -60, right: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: TEAL, opacity: 0.04,
  },
  bgGlow2: {
    position: 'absolute', bottom: 100, left: -30,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: BLUE, opacity: 0.05,
  },

  avatarSection: {
    alignItems: 'center',
    paddingTop: 32, paddingBottom: 20,
    gap: 6,
  },
  avatarOuter: { position: 'relative', marginBottom: 8 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: TEAL,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,212,200,0.08)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: TEAL, shadowOpacity: 0.3, shadowRadius: 12,
  },
  avatarImage: { width: 94, height: 94, borderRadius: 47 },
  avatarFallback: {
    width: 94, height: 94, borderRadius: 47,
    backgroundColor: 'rgba(0,212,200,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: TEAL, fontSize: 32, fontWeight: '800' },
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: GREEN,
    borderWidth: 3, borderColor: BG,
  },
  profileName: { color: WHITE, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  profileNameEn: { color: MUTED, fontSize: 14, textAlign: 'center' },
  profileRole: { color: TEAL, fontSize: 13, fontWeight: '500' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(0,212,200,0.06)',
  },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  pillText: { color: TEAL, fontSize: 11, fontWeight: '700' },

  quickActions: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20,
  },
  actionBtn: {
    flex: 1, backgroundColor: BG2,
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,212,200,0.1)',
    paddingVertical: 14, alignItems: 'center', gap: 6,
  },
  actionIcon: { fontSize: 22 },
  actionLabel: { color: MUTED, fontSize: 11, fontWeight: '600' },

  section: { paddingHorizontal: 20, marginBottom: 18 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,212,200,0.12)' },
  sectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    color: TEAL, fontSize: 11, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: BG2,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,212,200,0.08)',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoLabel: { color: MUTED, fontSize: 12, fontWeight: '500', flex: 1 },
  infoValue: { color: WHITE, fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },

  noProfileBox: { padding: 30, alignItems: 'center', gap: 8 },
  noProfileText: { color: MUTED, fontSize: 14, textAlign: 'center' },

  logoutBtn: {
    marginHorizontal: 20, marginTop: 8,
    paddingVertical: 16, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.06)',
    alignItems: 'center',
  },
  logoutText: { color: RED, fontSize: 15, fontWeight: '700' },
});
