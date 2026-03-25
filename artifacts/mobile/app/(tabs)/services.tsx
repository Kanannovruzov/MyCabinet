import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  ActivityIndicator, RefreshControl, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api, ServiceItem } from '@/services/api';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import OceanWaves from '@/components/ocean-waves';

const BASE_URL = 'https://seafarer.ddla.gov.az';

type TabKey = 'services' | 'requests';

const STATUS_LABELS: Record<number, string> = {
  0: 'Gözləmədə', 1: 'İcrada', 2: 'Geri qaytarıldı', 3: 'Tamamlandı', 4: 'Baxılmamış',
};
const STATUS_ICONS: Record<number, string> = {
  0: 'clock', 1: 'loader', 2: 'rotate-ccw', 3: 'check-circle', 4: 'eye-off',
};

type RequestItem = {
  no: string;
  tarix: string;
  service_name: string;
  status_id: number;
};

export default function ServicesScreen() {
  const { pin, session } = useAuth();
  const { colors } = useTheme();
  const C = colors;
  const [tab, setTab] = useState<TabKey>('services');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const statusColor = (id: number) => {
    if (id === 3) return C.green;
    if (id === 1) return C.teal;
    if (id === 0 || id === 2) return C.yellow;
    return C.red;
  };

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

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

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
            <Text style={[styles.pageTitle, { color: C.text }]}>Xidmətlər</Text>
            <Text style={[styles.pageSubtitle, { color: C.muted }]}>DDLA xidmətləri</Text>
          </View>
          <View style={[styles.tealPill, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
            <Feather name="anchor" size={12} color={C.teal} />
            <Text style={[styles.pillText, { color: C.teal }]}>DDLA</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              { borderColor: C.cardBorder, backgroundColor: C.cardBg },
              tab === 'services' && { borderColor: C.teal, backgroundColor: C.teal + '15' },
            ]}
            onPress={() => setTab('services')}
          >
            <Feather name="grid" size={14} color={tab === 'services' ? C.teal : C.muted} />
            <Text style={[styles.tabText, { color: C.muted }, tab === 'services' && { color: C.teal }]}>Xidmətlər</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              { borderColor: C.cardBorder, backgroundColor: C.cardBg },
              tab === 'requests' && { borderColor: C.teal, backgroundColor: C.teal + '15' },
            ]}
            onPress={() => setTab('requests')}
          >
            <Feather name="list" size={14} color={tab === 'requests' ? C.teal : C.muted} />
            <Text style={[styles.tabText, { color: C.muted }, tab === 'requests' && { color: C.teal }]}>Müraciətlərim</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.teal} />
          }
        >
          {tab === 'services' ? (
            services.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather name="briefcase" size={32} color={C.muted} />
                <Text style={{ color: C.muted, fontSize: 14 }}>Xidmət tapılmadı</Text>
              </View>
            ) : (
              services.map(svc => (
                <TouchableOpacity
                  key={svc.id}
                  style={[styles.svcCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}
                  onPress={() => {
                    const url = svc.url.startsWith('http') ? svc.url : `${BASE_URL}${svc.url}`;
                    Linking.openURL(url).catch(() => {});
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.svcIcon, { backgroundColor: C.teal + '12', borderColor: C.teal + '25' }]}>
                    <Feather name="anchor" size={18} color={C.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.svcName, { color: C.text }]} numberOfLines={2}>{svc.name}</Text>
                  </View>
                  <View style={[styles.svcArrow, { backgroundColor: C.teal + '12' }]}>
                    <Feather name="chevron-right" size={16} color={C.teal} />
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            requests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather name="file-text" size={32} color={C.muted} />
                <Text style={{ color: C.muted, fontSize: 14 }}>Müraciət tapılmadı</Text>
              </View>
            ) : (
              requests.map((req, i) => {
                const color = statusColor(req.status_id);
                const iconName = STATUS_ICONS[req.status_id] ?? 'help-circle';
                return (
                  <View key={i} style={[styles.reqCard, { backgroundColor: C.cardBg, borderColor: color + '25' }]}>
                    <View style={[styles.reqBar, { backgroundColor: color }]} />
                    <View style={styles.reqBody}>
                      <View style={[styles.reqBadge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
                        <Feather name={iconName as any} size={12} color={color} />
                        <Text style={[styles.reqStatus, { color }]}>{STATUS_LABELS[req.status_id] ?? 'Naməlum'}</Text>
                      </View>
                      <Text style={[styles.reqName, { color: C.text }]} numberOfLines={2}>{req.service_name}</Text>
                      <Text style={[styles.reqDate, { color: C.muted }]}>{req.tarix}  ·  {req.no}</Text>
                    </View>
                  </View>
                );
              })
            )
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
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  pageSubtitle: { fontSize: 12, marginTop: 2 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  svcCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 14, borderWidth: 1, padding: 16,
  },
  svcIcon: {
    width: 46, height: 46, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  svcName: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  svcArrow: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  reqCard: {
    flexDirection: 'row',
    borderRadius: 14, borderWidth: 1, overflow: 'hidden',
  },
  reqBar: { width: 4 },
  reqBody: { flex: 1, padding: 14, gap: 8 },
  reqBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1,
  },
  reqStatus: { fontSize: 12, fontWeight: '600' },
  reqName: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  reqDate: { fontSize: 11 },
  emptyBox: { padding: 40, alignItems: 'center', gap: 8 },
});
