import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, RefreshControl, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/services/api';

const BASE_URL = 'https://seafarer.ddla.gov.az';
const BG    = '#060d1a';
const TEAL  = '#00d4c8';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.45)';
const RED   = '#EF4444';

type DocItem = {
  id: number;
  code: string;
  date: string;
  name: string;
  viewUrl: string;
};

export default function DocumentsScreen() {
  const [docs, setDocs]             = useState<DocItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const data = await api.documents();
      if (data.ok) {
        setDocs(
          (data.items ?? []).map((r: any) => ({
            id:      r.id,
            code:    r.code,
            date:    r.date,
            name:    r.name,
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Sənədlər</Text>
          <Text style={styles.subtitle}>{docs.length} fayl</Text>
        </View>
        <View style={styles.tealPill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>DDLA</Text>
        </View>
      </View>

      <FlatList
        data={docs}
        keyExtractor={d => String(d.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={TEAL} />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Sənədlər yüklənə bilmədi</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Sənəd tapılmadı</Text>
            </View>
          )
        }
        renderItem={({ item: doc }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>📄</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.docName} numberOfLines={2}>{doc.code || doc.name}</Text>
                <Text style={styles.docDate}>{doc.date}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => Linking.openURL(doc.viewUrl)}
              activeOpacity={0.75}
            >
              <Text style={styles.viewBtnText}>Bax</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { alignItems: 'center', justifyContent: 'center' },
  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,200,0.1)',
    gap: 10,
  },
  backBtn:  { padding: 4 },
  backText: { color: TEAL, fontSize: 28, fontWeight: '300', lineHeight: 28 },
  title:    { color: WHITE, fontSize: 20, fontWeight: '700' },
  subtitle: { color: MUTED, fontSize: 11, marginTop: 1 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(0,212,200,0.06)',
  },
  pillDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  pillText: { color: TEAL, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  list: { padding: 16, gap: 10, paddingBottom: 32 },
  card: {
    backgroundColor: 'rgba(0,212,200,0.04)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.12)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(0,212,200,0.1)',
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  icon:    { fontSize: 20 },
  cardInfo: { flex: 1 },
  docName:  { color: WHITE, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  docDate:  { color: MUTED, fontSize: 11, marginTop: 2 },
  viewBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,212,200,0.12)',
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
  },
  viewBtnText: { color: TEAL, fontSize: 12, fontWeight: '700' },
  errorBox:  { padding: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12 },
  errorText: { color: RED, textAlign: 'center', fontSize: 13 },
  emptyBox:  { padding: 40, alignItems: 'center' },
  emptyText: { color: MUTED, fontSize: 14 },
});
