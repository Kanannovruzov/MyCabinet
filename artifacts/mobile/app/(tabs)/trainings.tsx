import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/context/auth';

const BASE_URL = 'https://seafarer.ddla.gov.az';
const BG    = '#060d1a';
const BG2   = '#0a1628';
const TEAL  = '#00d4c8';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.45)';
const RED   = '#EF4444';
const YELLOW = '#EAB308';
const GREEN  = '#22C55E';

type CourseItem = {
  id: number;
  title: string;
  description: string;
  reference_code: string;
  module_count: number;
  material_count: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked' | 'cooldown';
  extra_note: string;
  test_passed: boolean;
  test_score: number | null;
  course_url: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  not_started: { label: 'Başlanmayıb', color: MUTED },
  in_progress:  { label: 'Davam edir',  color: TEAL },
  completed:    { label: 'Tamamlanıb',  color: GREEN },
  locked:       { label: 'Kilidli',     color: MUTED },
  cooldown:     { label: 'Gözləmə',     color: YELLOW },
};

function CourseCard({ course, onPress }: { course: CourseItem; onPress: () => void }) {
  const cfg    = STATUS_CONFIG[course.status] ?? STATUS_CONFIG.not_started;
  const locked = course.status === 'locked' || course.status === 'cooldown';

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: cfg.color + '30' }, locked && styles.cardLocked]}
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.75}
    >
      <View style={[styles.cardBar, { backgroundColor: locked ? 'rgba(255,255,255,0.1)' : cfg.color }]} />
      <View style={styles.cardBody}>
        <View style={[styles.badge, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '40' }]}>
          <View style={[styles.badgeDot, { backgroundColor: cfg.color }]} />
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>

        <Text style={[styles.title, locked && { opacity: 0.5 }]} numberOfLines={2}>
          {course.title}
        </Text>
        {!!course.reference_code && <Text style={styles.refCode}>{course.reference_code}</Text>}
        {!!course.description && <Text style={styles.desc} numberOfLines={2}>{course.description}</Text>}
        {!!course.extra_note && <Text style={[styles.note, { color: cfg.color + 'cc' }]}>{course.extra_note}</Text>}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{course.module_count}</Text>
            <Text style={styles.statLbl}>Modul</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{course.material_count}</Text>
            <Text style={styles.statLbl}>Material</Text>
          </View>
          {course.test_passed && (
            <>
              <View style={styles.statSep} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: GREEN }]}>
                  {course.test_score != null ? `${Math.round(course.test_score)}%` : '✓'}
                </Text>
                <Text style={styles.statLbl}>Test</Text>
              </View>
            </>
          )}
        </View>

        {!locked && (
          <View style={[styles.actionBtn, { borderColor: cfg.color + '60', backgroundColor: cfg.color + '12' }]}>
            <Text style={[styles.actionText, { color: cfg.color }]}>
              {course.status === 'not_started' ? 'Başla' : course.status === 'completed' ? 'Yenidən bax' : 'Davam et'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function TrainingsScreen() {
  const { pin, session } = useAuth();
  const [courses, setCourses]       = useState<CourseItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${BASE_URL}/api/trainings`, {
        headers: { 'X-Mobile': '1', 'X-Pin': pin ?? '', 'X-Session': session ?? '' },
      });
      const data = await res.json();
      if (data.ok) setCourses(data.items);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePress = async (course: CourseItem) => {
    if (course.course_url) {
      await WebBrowser.openBrowserAsync(`${BASE_URL}${course.course_url}`);
    }
  };

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
          <Text style={styles.pageTitle}>Təlimlər</Text>
          <Text style={styles.pageSubtitle}>{courses.length} kurs</Text>
        </View>
        <View style={styles.tealPill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>DDLA</Text>
        </View>
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
            <Text style={styles.errorText}>Təlimlər yüklənə bilmədi</Text>
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Təlim tapılmadı</Text>
          </View>
        ) : (
          courses.map(c => <CourseCard key={c.id} course={c} onPress={() => handlePress(c)} />)
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

  list: { padding: 16, gap: 12 },

  card: {
    flexDirection: 'row',
    backgroundColor: BG2,
    borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
  },
  cardLocked: { opacity: 0.7 },
  cardBar:    { width: 4 },
  cardBody:   { flex: 1, padding: 16, gap: 8 },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
  },
  badgeDot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  title:   { color: WHITE, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  refCode: { color: MUTED, fontSize: 11 },
  desc:    { color: MUTED, fontSize: 12, lineHeight: 18 },
  note:    { fontSize: 11, fontStyle: 'italic' },

  stats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, padding: 10, gap: 12,
    marginTop: 4,
  },
  statItem:  { alignItems: 'center' },
  statVal:   { color: WHITE, fontSize: 16, fontWeight: '700' },
  statLbl:   { color: MUTED, fontSize: 10, marginTop: 2 },
  statSep:   { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },

  actionBtn: {
    borderRadius: 10, borderWidth: 1,
    paddingVertical: 10, alignItems: 'center',
    marginTop: 4,
  },
  actionText: { fontSize: 13, fontWeight: '700' },

  errorBox:  { padding: 20, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  errorText: { color: RED, textAlign: 'center', fontSize: 13 },
  emptyBox:  { padding: 40, alignItems: 'center' },
  emptyText: { color: MUTED, fontSize: 14 },
});
