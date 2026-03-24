import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { api, CertItem } from '@/services/api';
import ParticlesBg from '@/components/particles-bg';

const BG    = '#060d1a';
const BG2   = '#0a1628';
const TEAL  = '#00d4c8';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.45)';
const RED   = '#EF4444';
const YELLOW = '#EAB308';

function certStatusColor(percent: number, isUnlimited: boolean) {
  if (isUnlimited) return TEAL;
  if (percent > 50) return TEAL;
  if (percent > 20) return YELLOW;
  return RED;
}

function MiniCertCard({ cert }: { cert: CertItem }) {
  const isUnlimited = cert.days_label === 'Müddətsiz';
  const color = certStatusColor(cert.percent, isUnlimited);

  return (
    <View style={styles.certCard}>
      <View style={[styles.certLeftBar, { backgroundColor: color }]} />
      <View style={styles.certBody}>
        <Text style={styles.certName} numberOfLines={2}>{cert.cert_name}</Text>
        <Text style={styles.certCode}>{cert.code}</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${cert.percent}%` as any, backgroundColor: color }]} />
        </View>
        <View style={styles.certFooter}>
          <Text style={styles.certDates}>{cert.start}  →  {cert.end}</Text>
          <Text style={[styles.certDays, { color }]}>
            {isUnlimited ? 'Müddətsiz' : `${cert.days_left} gün`}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { pin } = useAuth();
  const [certs, setCerts]           = useState<CertItem[]>([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const [certsRes, notifRes] = await Promise.all([
        api.certificates(),
        api.notifications(),
      ]);
      if (certsRes.ok) setCerts(certsRes.items);
      else setError(true);
      if (notifRes.ok) setUnread(notifRes.unread);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activeCerts = certs.filter(c =>
    c.days_label === 'Müddətsiz' || (typeof c.days_left === 'number' && c.days_left > 0)
  );
  const nextExpiry = certs
    .filter(c => typeof c.days_left === 'number' && c.days_left > 0)
    .sort((a, b) => (a.days_left ?? 0) - (b.days_left ?? 0))[0];

  const initials = pin ? pin.slice(0, 2).toUpperCase() : '??';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ParticlesBg />
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Salam,</Text>
            <Text style={styles.pinText}>{pin}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
            <Text style={styles.notifIcon}>🔔</Text>
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{certs.length}</Text>
            <Text style={styles.statLabel}>Ümumi</Text>
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(0,212,200,0.3)' }]}>
            <Text style={[styles.statNum, { color: TEAL }]}>{activeCerts.length}</Text>
            <Text style={styles.statLabel}>Aktiv</Text>
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(239,68,68,0.3)' }]}>
            <Text style={[styles.statNum, { color: RED }]}>{certs.length - activeCerts.length}</Text>
            <Text style={styles.statLabel}>Bitmiş</Text>
          </View>
        </View>

        {/* Next expiry */}
        {nextExpiry && (
          <View style={styles.alertCard}>
            <View style={styles.alertDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Ən yaxın bitmə tarixi</Text>
              <Text style={styles.alertName} numberOfLines={1}>{nextExpiry.cert_name}</Text>
            </View>
            <Text style={[styles.alertDays, { color: nextExpiry.days_left! < 30 ? RED : YELLOW }]}>
              {nextExpiry.days_left} gün
            </Text>
          </View>
        )}

        {/* Quick links */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/documents')}>
            <Text style={styles.quickIcon}>📄</Text>
            <Text style={styles.quickText}>Sənədlər</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/feedback')}>
            <Text style={styles.quickIcon}>✉️</Text>
            <Text style={styles.quickText}>Əks-əlaqə</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/notifications')}>
            <Text style={styles.quickIcon}>🔔</Text>
            <Text style={styles.quickText}>Bildirişlər</Text>
          </TouchableOpacity>
        </View>

        {/* Certs section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sertifikatlar</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/certificates')}>
              <Text style={styles.seeAll}>Hamısı →</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Məlumatlar yüklənə bilmədi</Text>
              <TouchableOpacity onPress={() => load()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Yenidən cəhd et</Text>
              </TouchableOpacity>
            </View>
          ) : certs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Sertifikat tapılmadı</Text>
            </View>
          ) : (
            certs.slice(0, 4).map(cert => <MiniCertCard key={cert.id} cert={cert} />)
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { color: MUTED, fontSize: 13, fontWeight: '500' },
  pinText:  { color: WHITE, fontSize: 20, fontWeight: '700', marginTop: 2 },
  notifBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,212,200,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifIcon: { fontSize: 20 },
  badge: {
    position: 'absolute',
    top: -4, right: -4,
    backgroundColor: RED,
    borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: WHITE, fontSize: 10, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: BG2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    alignItems: 'center',
  },
  statNum:   { color: WHITE, fontSize: 22, fontWeight: '700' },
  statLabel: { color: MUTED, fontSize: 11, marginTop: 2 },

  alertCard: {
    margin: 20,
    marginBottom: 0,
    padding: 16,
    backgroundColor: 'rgba(234,179,8,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: YELLOW,
    shadowColor: YELLOW, shadowOpacity: 1, shadowRadius: 6,
  },
  alertTitle: { color: MUTED, fontSize: 11, fontWeight: '600' },
  alertName:  { color: WHITE, fontSize: 13, fontWeight: '600', marginTop: 2 },
  alertDays:  { fontSize: 16, fontWeight: '700' },

  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: BG2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.12)',
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  quickIcon: { fontSize: 22 },
  quickText: { color: MUTED, fontSize: 11, fontWeight: '600', textAlign: 'center' },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { color: WHITE, fontSize: 17, fontWeight: '700' },
  seeAll:       { color: TEAL, fontSize: 13, fontWeight: '600' },

  certCard: {
    flexDirection: 'row',
    backgroundColor: BG2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.1)',
    marginBottom: 10,
    overflow: 'hidden',
  },
  certLeftBar: { width: 4 },
  certBody:    { flex: 1, padding: 14 },
  certName:    { color: WHITE, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  certCode:    { color: MUTED, fontSize: 11, marginTop: 2 },
  progressBg: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, marginTop: 10,
  },
  progressFill: { height: 4, borderRadius: 2 },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  certDates: { color: MUTED, fontSize: 11 },
  certDays:  { fontSize: 12, fontWeight: '700' },

  errorBox: {
    padding: 20,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    gap: 12,
  },
  errorText: { color: RED, fontSize: 13, textAlign: 'center' },
  retryBtn:  {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
  },
  retryText: { color: RED, fontSize: 13, fontWeight: '600' },

  emptyBox:  { padding: 40, alignItems: 'center' },
  emptyText: { color: MUTED, fontSize: 14 },
});
