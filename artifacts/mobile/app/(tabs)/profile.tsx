import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { api, ProfileItem } from '@/services/api';
import ParticlesBg from '@/components/particles-bg';

const BG    = '#060d1a';
const BG2   = '#0a1628';
const TEAL  = '#00d4c8';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.45)';
const RED   = '#EF4444';

type InfoRowProps = { label: string; value: string | null | undefined };

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function ProfileScreen() {
  const { pin, session, clearAuth } = useAuth();
  const [profile, setProfile]       = useState<ProfileItem | null>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const manId = (session as any)?.manId ?? 0;
      if (manId) {
        const res = await api.profile(manId);
        if (res.ok) setProfile(res.item);
        else setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => {
    Alert.alert(
      'Çıxış',
      'Hesabdan çıxmaq istədiyinizə əminsiniz?',
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Çıx', style: 'destructive',
          onPress: () => { clearAuth(); router.replace('/login'); },
        },
      ]
    );
  };

  const initials = pin ? pin.slice(0, 2).toUpperCase() : '??';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={TEAL} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ParticlesBg />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={TEAL} />
        }
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          {profile ? (
            <>
              <Text style={styles.profileName}>{profile.name_az}</Text>
              <Text style={styles.profileSub}>{profile.crew || 'Dənizçi'}</Text>
            </>
          ) : (
            <>
              <Text style={styles.profileName}>PIN: {pin}</Text>
              <Text style={styles.profileSub}>Dənizçi Şəxsi Kabineti</Text>
            </>
          )}

          <View style={styles.tealPill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>DDLA Üzvü</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/documents')}>
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionText}>Sənədlər</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/notifications')}>
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionText}>Bildirişlər</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/feedback')}>
            <Text style={styles.actionIcon}>✉️</Text>
            <Text style={styles.actionText}>Müraciət</Text>
          </TouchableOpacity>
        </View>

        {/* Profile info */}
        {profile ? (
          <>
            <Section title="Şəxsi məlumatlar">
              <InfoRow label="Ad Soyad (AZ)" value={profile.name_az} />
              <InfoRow label="Ad Soyad (EN)" value={profile.name_en} />
              <InfoRow label="Cins" value={profile.gender} />
              <InfoRow label="Doğum tarixi" value={profile.dob} />
              <InfoRow label="FIN" value={profile.fin} />
              <InfoRow label="İnd. nömrəsi" value={profile.ind_num} />
            </Section>
            <Section title="Əlaqə məlumatları">
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Telefon 1" value={profile.phone1} />
              <InfoRow label="Telefon 2" value={profile.phone2} />
            </Section>
            <Section title="Dənizçi məlumatları">
              <InfoRow label="Müəssisə" value={profile.org} />
              <InfoRow label="Vəzifə" value={profile.crew} />
              <InfoRow label="Dənizçi şəhadətnaməsi" value={profile.seaman_id} />
              <InfoRow label="Verilmə tarixi" value={profile.seaman_issue} />
              <InfoRow label="Etibarlılıq tarixi" value={profile.seaman_valid} />
            </Section>
          </>
        ) : (
          <View style={styles.noProfileBox}>
            <Text style={styles.noProfileText}>Profil məlumatları mövcud deyil</Text>
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

  avatarSection: {
    alignItems: 'center',
    paddingTop: 32, paddingBottom: 24,
    gap: 8,
  },
  avatarOuter: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.25)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,212,200,0.05)',
  },
  avatarInner: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,212,200,0.12)',
  },
  avatarText:  { color: TEAL, fontSize: 26, fontWeight: '700' },
  profileName: { color: WHITE, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  profileSub:  { color: MUTED, fontSize: 13, textAlign: 'center' },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: 'rgba(0,212,200,0.06)',
    marginTop: 4,
  },
  pillDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  pillText: { color: TEAL, fontSize: 12, fontWeight: '700' },

  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20, gap: 10, marginBottom: 24,
  },
  actionBtn: {
    flex: 1, backgroundColor: '#0a1628',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,212,200,0.12)',
    paddingVertical: 14, alignItems: 'center', gap: 6,
  },
  actionIcon: { fontSize: 22 },
  actionText: { color: MUTED, fontSize: 11, fontWeight: '600' },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  sectionLine:  { flex: 1, height: 1, backgroundColor: 'rgba(0,212,200,0.15)' },
  sectionTitle: { color: TEAL, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  sectionCard: {
    backgroundColor: '#0a1628',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,212,200,0.1)',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: { color: MUTED, fontSize: 12, fontWeight: '500', flex: 1 },
  infoValue: { color: WHITE, fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },

  noProfileBox: { padding: 20, alignItems: 'center' },
  noProfileText: { color: MUTED, fontSize: 14, textAlign: 'center' },

  logoutBtn: {
    marginHorizontal: 20, marginTop: 8,
    paddingVertical: 16,
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    alignItems: 'center',
  },
  logoutText: { color: RED, fontSize: 15, fontWeight: '700' },
});
