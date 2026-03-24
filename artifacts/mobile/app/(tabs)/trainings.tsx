import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import OceanWaves from '@/components/ocean-waves';

const BASE_URL = 'https://seafarer.ddla.gov.az';

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

const STATUS_CONFIG: Record<string, { label: string; colorKey: string; icon: string }> = {
  not_started: { label: 'Başlanmayıb', colorKey: 'muted', icon: 'circle' },
  in_progress: { label: 'Davam edir', colorKey: 'teal', icon: 'play-circle' },
  completed: { label: 'Tamamlanıb', colorKey: 'green', icon: 'check-circle' },
  locked: { label: 'Kilidli', colorKey: 'muted', icon: 'lock' },
  cooldown: { label: 'Gözləmə', colorKey: 'yellow', icon: 'clock' },
};

function CourseCard({ course, onPress, colors: C }: { course: CourseItem; onPress: () => void; colors: any }) {
  const cfg = STATUS_CONFIG[course.status] ?? STATUS_CONFIG.not_started;
  const locked = course.status === 'locked' || course.status === 'cooldown';
  const color = (C as any)[cfg.colorKey] || C.muted;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.cardBg, borderColor: color + '30' }, locked && styles.cardLocked]}
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.75}
    >
      <View style={[styles.cardBar, { backgroundColor: locked ? C.divider : color }]} />
      <View style={styles.cardBody}>
        <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
          <Feather name={cfg.icon as any} size={12} color={color} />
          <Text style={[styles.badgeText, { color }]}>{cfg.label}</Text>
        </View>

        <Text style={[styles.courseTitle, { color: C.text }, locked && { opacity: 0.5 }]} numberOfLines={2}>
          {course.title}
        </Text>
        {!!course.reference_code && <Text style={[styles.refCode, { color: C.muted }]}>{course.reference_code}</Text>}
        {!!course.description && <Text style={[styles.desc, { color: C.muted }]} numberOfLines={2}>{course.description}</Text>}
        {!!course.extra_note && <Text style={[styles.note, { color: color + 'cc' }]}>{course.extra_note}</Text>}

        <View style={[styles.stats, { backgroundColor: C.glass }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: C.text }]}>{course.module_count}</Text>
            <Text style={[styles.statLbl, { color: C.muted }]}>Modul</Text>
          </View>
          <View style={[styles.statSep, { backgroundColor: C.divider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: C.text }]}>{course.material_count}</Text>
            <Text style={[styles.statLbl, { color: C.muted }]}>Material</Text>
          </View>
          {course.test_passed && (
            <>
              <View style={[styles.statSep, { backgroundColor: C.divider }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: C.green }]}>
                  {course.test_score != null ? `${Math.round(course.test_score)}%` : '✓'}
                </Text>
                <Text style={[styles.statLbl, { color: C.muted }]}>Test</Text>
              </View>
            </>
          )}
        </View>

        {!locked && (
          <View style={[styles.actionBtn, { borderColor: color + '60', backgroundColor: color + '12' }]}>
            <Feather
              name={course.status === 'not_started' ? 'play' : course.status === 'completed' ? 'refresh-cw' : 'arrow-right'}
              size={14} color={color}
            />
            <Text style={[styles.actionText, { color }]}>
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
  const { colors } = useTheme();
  const C = colors;
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const handlePress = async (course: CourseItem) => {
    if (course.course_url) {
      await WebBrowser.openBrowserAsync(`${BASE_URL}${course.course_url}`);
    }
  };

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
            <Text style={[styles.pageTitle, { color: C.text }]}>Təlimlər</Text>
            <Text style={[styles.pageSubtitle, { color: C.muted }]}>{courses.length} kurs</Text>
          </View>
          <View style={[styles.tealPill, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
            <Feather name="anchor" size={12} color={C.teal} />
            <Text style={[styles.pillText, { color: C.teal }]}>DDLA</Text>
          </View>
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
              <Text style={{ color: C.red, textAlign: 'center', fontSize: 13 }}>Təlimlər yüklənə bilmədi</Text>
            </View>
          ) : courses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="book" size={32} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 14 }}>Təlim tapılmadı</Text>
            </View>
          ) : (
            courses.map(c => <CourseCard key={c.id} course={c} onPress={() => handlePress(c)} colors={C} />)
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
  pageTitle: { fontSize: 22, fontWeight: '700' },
  pageSubtitle: { fontSize: 12, marginTop: 2 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    borderRadius: 16, borderWidth: 1, overflow: 'hidden',
  },
  cardLocked: { opacity: 0.7 },
  cardBar: { width: 4 },
  cardBody: { flex: 1, padding: 16, gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  courseTitle: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  refCode: { fontSize: 11 },
  desc: { fontSize: 12, lineHeight: 18 },
  note: { fontSize: 11, fontStyle: 'italic' },
  stats: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, padding: 10, gap: 12, marginTop: 4,
  },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700' },
  statLbl: { fontSize: 10, marginTop: 2 },
  statSep: { width: 1, height: 24 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 10, borderWidth: 1, paddingVertical: 10, marginTop: 4,
  },
  actionText: { fontSize: 13, fontWeight: '700' },
  errorBox: {
    padding: 20, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', gap: 8,
  },
  emptyBox: { padding: 40, alignItems: 'center', gap: 8 },
});
