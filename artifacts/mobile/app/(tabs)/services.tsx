import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, ServiceItem } from '@/services/api';
import { useAuth } from '@/context/auth';

const BASE_URL = 'https://seafarer.ddla.gov.az';
const BG     = '#060d1a';
const BG2    = '#0a1628';
const TEAL   = '#00d4c8';
const WHITE  = '#FFFFFF';
const MUTED  = 'rgba(255,255,255,0.45)';
const RED    = '#EF4444';
const YELLOW = '#EAB308';

type TabKey = 'services' | 'requests';

const STATUS_LABELS: Record<number, string> = {
  0: 'Gözləmədə',
  1: 'İcrada',
  2: 'Geri qaytarıldı',
  3: 'Tamamlandı',
  4: 'Baxılmamış',
};
const STATUS_COLORS: Record<number, string> = {
  0: YELLOW,
  1: TEAL,
  2: YELLOW,
  3: '#22C55E',
  4: RED,
};

type RequestItem = {
  no: string;
  tarix: string;
  service_name: string;
  status_id: number;
};

export default function ServicesScreen() {
  const { pin, session } = useAuth();
  const [tab, setTab]               = useState<TabKey>('services');
  const [services, setServices]     = useState<ServiceItem[]>([]);
  const [requests, setRequests]     = useState<RequestItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const [svcRes, reqRes] = await Promise.all([
        api.services(),
        fetch(`${BASE_URL}/mobile/services/requests`, {
          headers: { 'X-Mobile': '1', 'X-Pin': pin ?? '' },
        }).then(r => r.json()).catch(() => ({ ok: false, items: [] })),
      ]);
      if (svcRes.ok) setServices(svcRes.items);
      if (reqRes.ok) setRequests(reqRes.items ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={TEAL} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topbar}>
        <View>
          <Text style={styles.pageTitle}>Xidmətlər</Text>
          <Text style={styles.pageSubtitle}>DDLA xidmətləri</Text>
        </View>
        <View style={styles.tealPill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>DDLA</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'services' && styles.tabBtnActive]}
          onPress={() => setTab('services')}
        >
          <Text style={[styles.tabText, tab === 'services' && styles.tabTextActive]}>Xidmətlər</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'requests' && styles.tabBtnActive]}
          onPress={() => setTab('requests')}
        >
          <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>Müraciətlərim</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={TEAL} />
        }
      >
        {tab === 'services' ? (
          services.length === 0 ? (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>Xidmət tapılmadı</Text></View>
          ) : (
            services.map(svc => (
              <TouchableOpacity
                key={svc.id}
                style={styles.card}
                onPress={() => Linking.openURL(`${BASE_URL}${svc.url}`)}
                activeOpacity={0.75}
              >
                <View style={styles.svcIcon}>
                  <Text style={{ fontSize: 20 }}>🌊</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.svcName} numberOfLines={2}>{svc.name}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))
          )
        ) : (
          requests.length === 0 ? (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>Müraciət tapılmadı</Text></View>
          ) : (
            requests.map((req, i) => {
              const color = STATUS_COLORS[req.status_id] ?? MUTED;
              return (
                <View key={i} style={[styles.reqCard, { borderColor: color + '25' }]}>
                  <View style={[styles.reqBar, { backgroundColor: color }]} />
                  <View style={styles.reqBody}>
                    <View style={[styles.reqBadge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
                      <View style={[styles.reqDot, { backgroundColor: color }]} />
                      <Text style={[styles.reqStatus, { color }]}>{STATUS_LABELS[req.status_id] ?? 'Naməlum'}</Text>
                    </View>
                    <Text style={styles.reqName} numberOfLines={2}>{req.service_name}</Text>
                    <Text style={styles.reqDate}>{req.tarix}  ·  {req.no}</Text>
                  </View>
                </View>
              );
            })
          )
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { alignItems: 'center', justifyContent: 'center' },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,200,0.1)',
  },
  pageTitle:    { color: WHITE, fontSize: 22, fontWeight: '700' },
  pageSubtitle: { color: MUTED, fontSize: 12, marginTop: 2 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(0,212,200,0.06)',
  },
  pillDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  pillText: { color: TEAL, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tabBtnActive: { borderColor: TEAL, backgroundColor: 'rgba(0,212,200,0.12)' },
  tabText:       { color: MUTED, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: TEAL },

  list: { padding: 16, gap: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#0a1628',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,212,200,0.1)',
    padding: 16,
  },
  svcIcon: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: 'rgba(0,212,200,0.08)',
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  svcName: { color: WHITE, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  arrow:   { color: TEAL, fontSize: 22, fontWeight: '300' },

  reqCard: {
    flexDirection: 'row',
    backgroundColor: '#0a1628',
    borderRadius: 14, borderWidth: 1, overflow: 'hidden',
  },
  reqBar:  { width: 4 },
  reqBody: { flex: 1, padding: 14, gap: 8 },
  reqBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
  },
  reqDot:    { width: 6, height: 6, borderRadius: 3 },
  reqStatus: { fontSize: 12, fontWeight: '600' },
  reqName:   { color: WHITE, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  reqDate:   { color: MUTED, fontSize: 11 },

  emptyBox:  { padding: 40, alignItems: 'center' },
  emptyText: { color: MUTED, fontSize: 14 },
});
