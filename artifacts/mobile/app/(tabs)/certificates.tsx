import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api, CertItem } from '@/services/api';
import { useTheme } from '@/context/theme';
import OceanWaves from '@/components/ocean-waves';

type Filter = 'all' | 'active' | 'expired';

function certColor(percent: number, isUnlimited: boolean, isExpired: boolean) {
  if (isExpired) return '#EF4444';
  if (isUnlimited) return '#00d4c8';
  if (percent > 50) return '#00d4c8';
  if (percent > 20) return '#EAB308';
  return '#EF4444';
}

function CertCard({ cert, colors: C }: { cert: CertItem; colors: any }) {
  const isUnlimited = cert.days_label === 'Müddətsiz';
  const isExpired = !isUnlimited && (cert.days_left === 0 || cert.status === 'Müddəti bitib');
  const color = certColor(cert.percent, isUnlimited, isExpired);

  return (
    <View style={[styles.card, { backgroundColor: C.cardBg, borderColor: color + '25' }]}>
      <View style={[styles.cardBar, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
          <View style={[styles.badgeDot, { backgroundColor: color }]} />
          <Text style={[styles.badgeText, { color }]}>
            {isUnlimited ? 'Müddətsiz' : isExpired ? 'Müddəti bitib' : `${cert.days_left} gün qalıb`}
          </Text>
        </View>

        <Text style={[styles.certName, { color: C.text }]} numberOfLines={3}>{cert.cert_name}</Text>
        {!!cert.code && <Text style={[styles.certCode, { color: C.muted }]}>{cert.code}</Text>}
        {!!cert.sub && <Text style={[styles.certSub, { color: C.muted }]} numberOfLines={1}>{cert.sub}</Text>}

        {!isUnlimited && (
          <>
            <View style={[styles.progressBg, { backgroundColor: C.divider }]}>
              <View style={[styles.progressFill, { width: `${cert.percent}%` as any, backgroundColor: color }]} />
            </View>
            <Text style={[styles.percent, { color }]}>{cert.percent}%</Text>
          </>
        )}

        <View style={styles.dates}>
          <View style={styles.dateItem}>
            <Text style={[styles.dateLabel, { color: C.muted }]}>Başlama tarixi</Text>
            <Text style={[styles.dateValue, { color: C.text }]}>{cert.start || '—'}</Text>
          </View>
          <View style={[styles.dateSep, { backgroundColor: C.divider }]} />
          <View style={styles.dateItem}>
            <Text style={[styles.dateLabel, { color: C.muted }]}>Bitmə tarixi</Text>
            <Text style={[styles.dateValue, isExpired && { color: C.red }]}>{cert.end || '—'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CertificatesScreen() {
  const { colors } = useTheme();
  const C = colors;
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
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
    const isExpired = !isUnlimited && (c.days_left === 0 || c.status === 'Müddəti bitib');
    if (filter === 'active') return !isExpired;
    if (filter === 'expired') return !!isExpired;
    return true;
  });

  const activeCerts = certs.filter(c => {
    const isUnlimited = c.days_label === 'Müddətsiz';
    return isUnlimited || !(c.days_left === 0 || c.status === 'Müddəti bitib');
  });
  const expiredCount = certs.length - activeCerts.length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.teal} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.bgGlow1, { backgroundColor: C.teal }]} />
      <View style={[styles.bgGlow2, { backgroundColor: C.blue }]} />
      <OceanWaves color={C.teal} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={[styles.topbar, { borderBottomColor: C.divider }]}>
          <View>
            <Text style={[styles.title, { color: C.text }]}>Sertifikatlar</Text>
            <Text style={[styles.subtitle, { color: C.muted }]}>{certs.length} sertifikat</Text>
          </View>
          <View style={[styles.tealPill, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
            <Feather name="anchor" size={12} color={C.teal} />
            <Text style={[styles.pillText, { color: C.teal }]}>DDLA</Text>
          </View>
        </View>

        <View style={[styles.statsRow, { borderBottomColor: C.divider }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.text }]}>{certs.length}</Text>
            <Text style={[styles.statLabel, { color: C.muted }]}>Cəmi</Text>
          </View>
          <View style={[styles.statSep, { backgroundColor: C.divider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.green }]}>{activeCerts.length}</Text>
            <Text style={[styles.statLabel, { color: C.muted }]}>Aktiv</Text>
          </View>
          <View style={[styles.statSep, { backgroundColor: C.divider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: expiredCount > 0 ? C.red : C.muted }]}>{expiredCount}</Text>
            <Text style={[styles.statLabel, { color: C.muted }]}>Bitmiş</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'active', 'expired'] as Filter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                { borderColor: C.cardBorder, backgroundColor: C.cardBg },
                filter === f && { borderColor: C.teal, backgroundColor: C.teal + '15' },
              ]}
              onPress={() => setFilter(f)}
            >
              <Feather
                name={f === 'all' ? 'list' : f === 'active' ? 'check-circle' : 'alert-circle'}
                size={14}
                color={filter === f ? C.teal : C.muted}
              />
              <Text style={[styles.filterText, { color: C.muted }, filter === f && { color: C.teal }]}>
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
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.teal} />
          }
        >
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: C.red + '10', borderColor: C.red + '25' }]}>
              <Feather name="alert-triangle" size={20} color={C.red} />
              <Text style={{ color: C.red, textAlign: 'center', fontSize: 13 }}>Sertifikatlar yüklənə bilmədi</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="inbox" size={32} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 14 }}>Sertifikat tapılmadı</Text>
            </View>
          ) : (
            filtered.map(cert => <CertCard key={cert.id} cert={cert} colors={C} />)
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  bgGlow1: {
    position: 'absolute', top: -80, right: -60,
    width: 200, height: 200, borderRadius: 100, opacity: 0.04,
  },
  bgGlow2: {
    position: 'absolute', bottom: 100, left: -40,
    width: 160, height: 160, borderRadius: 80, opacity: 0.05,
  },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, marginHorizontal: 20,
    borderBottomWidth: 1,
  },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, fontWeight: '500' },
  statSep: { width: 1, height: 28 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    borderRadius: 16, borderWidth: 1, overflow: 'hidden',
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
  certName: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  certCode: { fontSize: 12, marginTop: 4 },
  certSub: { fontSize: 11, marginTop: 2 },
  progressBg: { height: 4, borderRadius: 2, marginTop: 12 },
  progressFill: { height: 4, borderRadius: 2 },
  percent: { fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'right' },
  dates: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12,
  },
  dateItem: { flex: 1 },
  dateLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { fontSize: 13, fontWeight: '600', marginTop: 3 },
  dateSep: { width: 1, height: 28 },
  errorBox: {
    padding: 20, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', gap: 8,
  },
  emptyBox: { padding: 40, alignItems: 'center', gap: 8 },
});
