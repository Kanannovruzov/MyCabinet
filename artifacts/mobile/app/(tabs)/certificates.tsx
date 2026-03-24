import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api, CertItem } from '@/services/api';
import OceanWaves from '@/components/ocean-waves';

const BG     = '#060d1a';
const TEAL   = '#00d4c8';
const WHITE  = '#FFFFFF';
const MUTED  = 'rgba(255,255,255,0.45)';
const RED    = '#EF4444';
const YELLOW = '#EAB308';
const BLUE   = '#0057B7';

type Filter = 'all' | 'active' | 'expired';

function certColor(percent: number, isUnlimited: boolean, isExpired: boolean) {
  if (isExpired)    return RED;
  if (isUnlimited)  return TEAL;
  if (percent > 50) return TEAL;
  if (percent > 20) return YELLOW;
  return RED;
}

function CertCard({ cert }: { cert: CertItem }) {
  const isUnlimited = cert.days_label === 'Müddətsiz';
  const isExpired   = !isUnlimited && (cert.days_left === 0 || cert.status === 'Müddəti bitib');
  const color       = certColor(cert.percent, isUnlimited, isExpired);

  return (
    <View style={[styles.card, { borderColor: color + '25' }]}>
      <View style={[styles.cardBar, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
          <View style={[styles.badgeDot, { backgroundColor: color }]} />
          <Text style={[styles.badgeText, { color }]}>
            {isUnlimited ? 'Müddətsiz' : isExpired ? 'Müddəti bitib' : `${cert.days_left} gün qalıb`}
          </Text>
        </View>

        <Text style={styles.certName} numberOfLines={3}>{cert.cert_name}</Text>
        {!!cert.code && <Text style={styles.certCode}>{cert.code}</Text>}
        {!!cert.sub  && <Text style={styles.certSub} numberOfLines={1}>{cert.sub}</Text>}

        {!isUnlimited && (
          <>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${cert.percent}%` as any, backgroundColor: color }]} />
            </View>
            <Text style={[styles.percent, { color }]}>{cert.percent}%</Text>
          </>
        )}

        <View style={styles.dates}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Başlama tarixi</Text>
            <Text style={styles.dateValue}>{cert.start || '—'}</Text>
          </View>
          <View style={styles.dateSep} />
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Bitmə tarixi</Text>
            <Text style={[styles.dateValue, isExpired && { color: RED }]}>{cert.end || '—'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CertificatesScreen() {
  const [certs, setCerts]           = useState<CertItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);
  const [filter, setFilter]         = useState<Filter>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const res = await api.certificates();
      if (res.ok) setCerts(res.items);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const filtered = certs.filter(c => {
    const isUnlimited = c.days_label === 'Müddətsiz';
    const isExpired   = !isUnlimited && (c.days_left === 0 || c.status === 'Müddəti bitib');
    if (filter === 'active')  return !isExpired;
    if (filter === 'expired') return !!isExpired;
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={TEAL} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OceanWaves />
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.title}>Sertifikatlar</Text>
            <Text style={styles.subtitle}>{certs.length} sertifikat</Text>
          </View>
          <View style={styles.tealPill}>
            <Feather name="anchor" size={12} color={TEAL} />
            <Text style={styles.pillText}>DDLA</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'active', 'expired'] as Filter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Hamısı' : f === 'active' ? 'Aktiv' : 'Bitmiş'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={TEAL} />
          }
        >
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-triangle" size={20} color={RED} />
              <Text style={styles.errorText}>Sertifikatlar yüklənə bilmədi</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="inbox" size={32} color={MUTED} />
              <Text style={styles.emptyText}>Sertifikat tapılmadı</Text>
            </View>
          ) : (
            filtered.map(cert => <CertCard key={cert.id} cert={cert} />)
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060d1a' },
  center:    { alignItems: 'center', justifyContent: 'center' },

  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,200,0.1)',
  },
  title:    { color: WHITE, fontSize: 22, fontWeight: '700' },
  subtitle: { color: MUTED, fontSize: 12, marginTop: 2 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(0,212,200,0.06)',
  },
  pillText: { color: TEAL, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterBtnActive: {
    borderColor: TEAL,
    backgroundColor: 'rgba(0,212,200,0.12)',
  },
  filterText:       { color: MUTED, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: TEAL },

  list: { padding: 16, gap: 12 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#0a1628',
    borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
  },
  cardBar: { width: 4 },
  cardContent: { flex: 1, padding: 16 },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, marginBottom: 10,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  certName: { color: WHITE, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  certCode: { color: MUTED, fontSize: 12, marginTop: 4 },
  certSub:  { color: MUTED, fontSize: 11, marginTop: 2 },

  progressBg:   { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 12 },
  progressFill: { height: 4, borderRadius: 2 },
  percent:      { fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'right' },

  dates: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 12, gap: 12,
  },
  dateItem: { flex: 1 },
  dateLabel: { color: MUTED, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { color: WHITE, fontSize: 13, fontWeight: '600', marginTop: 3 },
  dateSep:   { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },

  errorBox:  { padding: 20, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', alignItems: 'center', gap: 8 },
  errorText: { color: RED, textAlign: 'center', fontSize: 13 },
  emptyBox:  { padding: 40, alignItems: 'center', gap: 8 },
  emptyText: { color: MUTED, fontSize: 14 },
});
