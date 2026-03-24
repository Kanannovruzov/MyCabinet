import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Animated,
  ActivityIndicator, TouchableOpacity, RefreshControl, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { useTheme } from '@/context/theme';
import OceanWaves from '@/components/ocean-waves';

const BASE_URL = 'https://seafarer.ddla.gov.az';

type DocItem = {
  id: number;
  code: string;
  date: string;
  name: string;
  viewUrl: string;
};

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const C = colors;
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const data = await api.documents();
      if (data.ok) {
        setDocs(
          (data.items ?? []).map((r: any) => ({
            id: r.id,
            code: r.code,
            date: r.date,
            name: r.name,
            viewUrl: `${BASE_URL}/files/show/${r.code}`,
          }))
        );
      } else {
        setError(true);
      }
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
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.glass, borderColor: C.glassBorder }]}>
            <Feather name="arrow-left" size={22} color={C.teal} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: C.text }]}>Sənədlər</Text>
            <Text style={[styles.subtitle, { color: C.muted }]}>{docs.length} fayl</Text>
          </View>
          <View style={[styles.tealPill, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
            <View style={[styles.pillDot, { backgroundColor: C.teal }]} />
            <Text style={[styles.pillText, { color: C.teal }]}>DDLA</Text>
          </View>
        </View>

        <FlatList
          data={docs}
          keyExtractor={d => String(d.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.teal} />
          }
          ListEmptyComponent={
            error ? (
              <View style={[styles.errorBox, { backgroundColor: C.red + '10', borderColor: C.red + '30' }]}>
                <Feather name="alert-triangle" size={20} color={C.red} />
                <Text style={[styles.errorText, { color: C.red }]}>Sənədlər yüklənə bilmədi</Text>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Feather name="folder" size={32} color={C.muted} />
                <Text style={[styles.emptyText, { color: C.muted }]}>Sənəd tapılmadı</Text>
              </View>
            )
          }
          renderItem={({ item: doc }) => (
            <View style={[styles.card, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconBox, { backgroundColor: C.teal + '12', borderColor: C.teal + '25' }]}>
                  <Feather name="file-text" size={20} color={C.teal} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.docName, { color: C.text }]} numberOfLines={2}>{doc.code || doc.name}</Text>
                  <Text style={[styles.docDate, { color: C.muted }]}>{doc.date}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.viewBtn, { backgroundColor: C.teal + '12', borderColor: C.teal + '30' }]}
                onPress={() => Linking.openURL(doc.viewUrl)}
                activeOpacity={0.75}
              >
                <Feather name="external-link" size={14} color={C.teal} />
                <Text style={[styles.viewBtnText, { color: C.teal }]}>Bax</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </Animated.View>
    </SafeAreaView>
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
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 11, marginTop: 1 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  card: {
    borderRadius: 14, padding: 14,
    borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  docName: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  docDate: { fontSize: 11, marginTop: 2 },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1,
  },
  viewBtnText: { fontSize: 12, fontWeight: '700' },
  errorBox: {
    padding: 16, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', gap: 8,
  },
  errorText: { textAlign: 'center', fontSize: 13 },
  emptyBox: { padding: 40, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14 },
});
