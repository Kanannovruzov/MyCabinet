import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, RefreshControl, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api, NotifItem } from '@/services/api';

const BG    = '#060d1a';
const TEAL  = '#00d4c8';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.45)';
const RED   = '#EF4444';

function NotifCard({ item, onPress, expanded }: { item: NotifItem; onPress: () => void; expanded: boolean }) {
  const isUnread = item.is_read === 0;

  return (
    <TouchableOpacity style={[styles.card, isUnread && styles.cardUnread, expanded && styles.cardExpanded]} onPress={onPress} activeOpacity={0.75}>
      {isUnread && <View style={styles.unreadDot} />}
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, isUnread && { color: WHITE }]}>{item.title}</Text>
        {expanded && !!item.body ? (
          <Text style={styles.cardBodyFull}>{item.body}</Text>
        ) : (
          !!item.body && <Text style={styles.cardBody2} numberOfLines={2}>{item.body}</Text>
        )}
        <Text style={styles.cardDate}>{item.created_at}</Text>
      </View>
      <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 18, alignSelf: 'center' }}>{expanded ? '‹' : '›'}</Text>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const [items, setItems]           = useState<NotifItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const res = await api.notifications();
      if (res.ok) setItems(res.items);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePress = async (item: NotifItem) => {
    if (item.is_read === 0) {
      api.markRead(item.id).catch(() => {});
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_read: 1 } : i));
    }
    setExpandedId(prev => prev === item.id ? null : item.id);
  };

  const markAll = async () => {
    await api.markAllRead();
    setItems(prev => prev.map(i => ({ ...i, is_read: 1 })));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={TEAL} size="large" />
      </SafeAreaView>
    );
  }

  const unread = items.filter(i => i.is_read === 0).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Bildirişlər</Text>
          {unread > 0 && <Text style={styles.subtitle}>{unread} oxunmamış</Text>}
        </View>
        {unread > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAll}>
            <Text style={styles.markAllText}>Hamısını oxu</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={TEAL} />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.errorBox}><Text style={styles.errorText}>Bildirişlər yüklənə bilmədi</Text></View>
          ) : (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>Bildiriş tapılmadı</Text></View>
          )
        }
        renderItem={({ item }) => <NotifCard item={item} expanded={expandedId === item.id} onPress={() => handlePress(item)} />}
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
  markAllBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
    backgroundColor: 'rgba(0,212,200,0.08)',
  },
  markAllText: { color: TEAL, fontSize: 12, fontWeight: '600' },

  list: { padding: 16, gap: 10, paddingBottom: 32 },

  card: {
    backgroundColor: '#0a1628',
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row', gap: 12,
  },
  cardUnread: { borderColor: 'rgba(0,212,200,0.2)', backgroundColor: 'rgba(0,212,200,0.04)' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: TEAL,
    marginTop: 4,
    shadowColor: TEAL, shadowOpacity: 1, shadowRadius: 4,
  },
  cardExpanded: { borderColor: 'rgba(0,212,200,0.25)' },
  cardBody:  { flex: 1 },
  cardTitle: { color: MUTED, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  cardBody2: { color: MUTED, fontSize: 12, lineHeight: 18, marginTop: 4 },
  cardBodyFull: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 22, marginTop: 8 },
  cardDate:  { color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 8 },

  errorBox:  { padding: 20, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12 },
  errorText: { color: RED, textAlign: 'center', fontSize: 13 },
  emptyBox:  { padding: 40, alignItems: 'center' },
  emptyText: { color: MUTED, fontSize: 14 },
});
