import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Animated,
  ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api, NotifItem } from '@/services/api';
import { useTheme } from '@/context/theme';
import OceanWaves from '@/components/ocean-waves';

function NotifCard({ item, onPress, expanded, colors: C }: { item: NotifItem; onPress: () => void; expanded: boolean; colors: any }) {
  const isUnread = item.is_read === 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: C.cardBg, borderColor: C.cardBorder },
        isUnread && { borderColor: C.teal + '30', backgroundColor: C.glass },
        expanded && { borderColor: C.teal + '40' },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.cardIcon, { backgroundColor: isUnread ? C.teal + '15' : C.cardBorder }]}>
        <Feather name={isUnread ? 'bell' : 'check'} size={16} color={isUnread ? C.teal : C.muted} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: isUnread ? C.text : C.muted }]}>{item.title}</Text>
        {expanded && !!item.body ? (
          <Text style={[styles.cardBodyFull, { color: C.text + 'cc' }]}>{item.body}</Text>
        ) : (
          !!item.body && <Text style={[styles.cardBody2, { color: C.muted }]} numberOfLines={2}>{item.body}</Text>
        )}
        <Text style={[styles.cardDate, { color: C.muted + '80' }]}>{item.created_at}</Text>
      </View>
      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={C.muted} />
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const C = colors;
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

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
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.teal} size="large" />
      </SafeAreaView>
    );
  }

  const unread = items.filter(i => i.is_read === 0).length;

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
            <Text style={[styles.title, { color: C.text }]}>Bildirişlər</Text>
            {unread > 0 && <Text style={[styles.subtitle, { color: C.muted }]}>{unread} oxunmamış</Text>}
          </View>
          {unread > 0 && (
            <TouchableOpacity style={[styles.markAllBtn, { borderColor: C.glassBorder, backgroundColor: C.glass }]} onPress={markAll}>
              <Feather name="check-circle" size={14} color={C.teal} />
              <Text style={[styles.markAllText, { color: C.teal }]}>Hamısını oxu</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.teal} />
          }
          ListEmptyComponent={
            error ? (
              <View style={[styles.errorBox, { backgroundColor: C.red + '10', borderColor: C.red + '30' }]}>
                <Feather name="alert-triangle" size={20} color={C.red} />
                <Text style={[styles.errorText, { color: C.red }]}>Bildirişlər yüklənə bilmədi</Text>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Feather name="bell-off" size={32} color={C.muted} />
                <Text style={[styles.emptyText, { color: C.muted }]}>Bildiriş tapılmadı</Text>
              </View>
            )
          }
          renderItem={({ item }) => <NotifCard item={item} expanded={expandedId === item.id} onPress={() => handlePress(item)} colors={C} />}
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
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1,
  },
  markAllText: { fontSize: 12, fontWeight: '600' },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  card: {
    borderRadius: 14, padding: 14,
    borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  cardIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  cardBody2: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  cardBodyFull: { fontSize: 14, lineHeight: 22, marginTop: 8 },
  cardDate: { fontSize: 11, marginTop: 8 },
  errorBox: {
    padding: 20, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', gap: 8,
  },
  errorText: { textAlign: 'center', fontSize: 13 },
  emptyBox: { padding: 40, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14 },
});
