import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  ActivityIndicator, RefreshControl, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import { api, CertItem } from '@/services/api';
import OceanWaves from '@/components/ocean-waves';

function PulsingDot({ size = 14, bgColor = '#060d1a' }: { size?: number; bgColor?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 2.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <View style={{ position: 'absolute', bottom: 0, right: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: '#22C55E', transform: [{ scale }], opacity }} />
      <View style={{ width: size - 3, height: size - 3, borderRadius: (size - 3) / 2, backgroundColor: '#22C55E', borderWidth: 2, borderColor: bgColor }} />
    </View>
  );
}

function certColor(percent: number, unlimited: boolean) {
  if (unlimited) return '#00d4c8';
  if (percent > 50) return '#22C55E';
  if (percent > 20) return '#EAB308';
  return '#EF4444';
}

function MiniCertCard({ cert, colors: C }: { cert: CertItem; colors: any }) {
  const unlimited = cert.days_label === 'Müddətsiz';
  const color = certColor(cert.percent, unlimited);

  return (
    <View style={[styles.certCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
      <View style={[styles.certAccent, { backgroundColor: color }]} />
      <View style={styles.certContent}>
        <View style={styles.certTop}>
          <View style={[styles.certBadge, { backgroundColor: color + '15', borderColor: color + '40' }]}>
            <View style={[styles.certBadgeDot, { backgroundColor: color }]} />
            <Text style={[styles.certBadgeText, { color }]}>
              {unlimited ? 'Müddətsiz' : `${cert.days_left} gün`}
            </Text>
          </View>
          {!unlimited && <Text style={[styles.certPercent, { color }]}>{cert.percent}%</Text>}
        </View>
        <Text style={[styles.certName, { color: C.text }]} numberOfLines={2}>{cert.cert_name}</Text>
        {!unlimited && (
          <View style={styles.certBarBg}>
            <View style={[styles.certBarFill, { width: `${cert.percent}%` as any, backgroundColor: color }]} />
          </View>
        )}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { pin, nameAz, photoUrl, setAuth } = useAuth();
  const { colors } = useTheme();
  const C = colors;
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const [certsRes, notifRes, profileRes] = await Promise.all([
        api.certificates(),
        api.notifications(),
        api.profile().catch(() => ({ ok: false, item: null })),
      ]);
      if (certsRes.ok) setCerts(certsRes.items);
      else setError(true);
      if (notifRes.ok) setUnread(notifRes.unread);
      if (profileRes.ok && profileRes.item) {
        const p = profileRes.item;
        const shortNameAz = p.name_azD || p.name_az;
        const shortNameEn = p.name_enD || p.name_en;
        const id = p.unikal || p.colID;
        const pUrl = id ? `https://seafarer.ddla.gov.az/image/${id}` : undefined;
        setProfileName(shortNameAz || null);
        setProfilePhoto(pUrl || null);
        setAuth(pin!, { nameAz: shortNameAz, nameEn: shortNameEn, photoUrl: pUrl });
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

  const activeCerts = certs.filter(c =>
    c.days_label === 'Müddətsiz' || (typeof c.days_left === 'number' && c.days_left > 0)
  );
  const expiredCerts = certs.length - activeCerts.length;
  const nextExpiry = certs
    .filter(c => typeof c.days_left === 'number' && c.days_left > 0)
    .sort((a, b) => (a.days_left ?? 0) - (b.days_left ?? 0))[0];

  const finalName = nameAz || profileName;
  const displayName = finalName || pin || '---';
  const initials = finalName
    ? finalName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : (pin ? pin.slice(0, 2).toUpperCase() : '??');
  const userPhoto = photoUrl || profilePhoto;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.teal} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.bgCircle1, { backgroundColor: C.teal }]} />
      <View style={[styles.bgCircle2, { backgroundColor: C.blue }]} />
      <OceanWaves color={C.teal} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.teal} />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/(tabs)/profile')}>
                {userPhoto ? (
                  <Image source={{ uri: userPhoto }} style={[styles.avatarImg, { borderColor: C.teal }]} />
                ) : (
                  <View style={[styles.avatarFallback, { borderColor: C.teal, backgroundColor: C.teal + '12' }]}>
                    <Text style={[styles.avatarInitials, { color: C.teal }]}>{initials}</Text>
                  </View>
                )}
                <PulsingDot bgColor={C.bg} />
              </TouchableOpacity>
              <View>
                <Text style={[styles.greeting, { color: C.muted }]}>Xoş gəldiniz</Text>
                <Text style={[styles.nameText, { color: C.text }]}>{displayName}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.notifBtn, { backgroundColor: C.glass, borderColor: C.glassBorder }]} onPress={() => router.navigate('/notifications')}>
              <Feather name="bell" size={20} color={C.teal} />
              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.welcomeCard, { borderColor: C.glassBorder, backgroundColor: C.cardBg }]}>
            <View style={[styles.wcGlow, { backgroundColor: C.teal }]} />
            <View style={styles.wcContent}>
              <View style={styles.wcTop}>
                <View style={[styles.wcLogo, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
                  <Feather name="anchor" size={14} color={C.teal} />
                  <Text style={[styles.wcLogoText, { color: C.teal }]}>DDLA</Text>
                </View>
                <View style={[styles.wcBadge, { backgroundColor: C.green + '12', borderColor: C.green + '30' }]}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
                  <Text style={{ color: C.green, fontSize: 11, fontWeight: '700' }}>Aktiv</Text>
                </View>
              </View>
              <Text style={[styles.wcTitle, { color: C.text }]}>Dənizçi Kabineti</Text>
              <Text style={[styles.wcSub, { color: C.muted }]}>Sertifikat və sənədlərinizi idarə edin</Text>
              <View style={[styles.wcLine, { backgroundColor: C.divider }]} />
              <View style={styles.wcStats}>
                <View style={styles.wcStatItem}>
                  <Text style={[styles.wcStatNum, { color: C.text }]}>{certs.length}</Text>
                  <Text style={[styles.wcStatLabel, { color: C.muted }]}>Sertifikat</Text>
                </View>
                <View style={[styles.wcStatDivider, { backgroundColor: C.divider }]} />
                <View style={styles.wcStatItem}>
                  <Text style={[styles.wcStatNum, { color: C.green }]}>{activeCerts.length}</Text>
                  <Text style={[styles.wcStatLabel, { color: C.muted }]}>Aktiv</Text>
                </View>
                <View style={[styles.wcStatDivider, { backgroundColor: C.divider }]} />
                <View style={styles.wcStatItem}>
                  <Text style={[styles.wcStatNum, { color: expiredCerts > 0 ? C.red : C.muted }]}>{expiredCerts}</Text>
                  <Text style={[styles.wcStatLabel, { color: C.muted }]}>Bitmiş</Text>
                </View>
              </View>
            </View>
          </View>

          {nextExpiry && (
            <View style={[styles.alertCard, {
              backgroundColor: (nextExpiry.days_left! < 30 ? C.red : C.yellow) + '08',
              borderColor: (nextExpiry.days_left! < 30 ? C.red : C.yellow) + '25',
            }]}>
              <View style={styles.alertLeft}>
                <View style={[styles.alertIconBg, { backgroundColor: (nextExpiry.days_left! < 30 ? C.red : C.yellow) + '15' }]}>
                  <Feather name="clock" size={18} color={nextExpiry.days_left! < 30 ? C.red : C.yellow} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertLabel, { color: C.muted }]}>Ən yaxın bitmə</Text>
                  <Text style={[styles.alertName, { color: C.text }]} numberOfLines={1}>{nextExpiry.cert_name}</Text>
                </View>
              </View>
              <View style={[styles.alertDaysBadge, {
                borderColor: (nextExpiry.days_left! < 30 ? C.red : C.yellow) + '40',
                backgroundColor: (nextExpiry.days_left! < 30 ? C.red : C.yellow) + '10',
              }]}>
                <Text style={[styles.alertDaysNum, { color: nextExpiry.days_left! < 30 ? C.red : C.yellow }]}>
                  {nextExpiry.days_left}
                </Text>
                <Text style={[styles.alertDaysLabel, { color: C.muted }]}>gün</Text>
              </View>
            </View>
          )}

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]} onPress={() => router.push('/(tabs)/certificates')}>
              <View style={[styles.actionIcon, { backgroundColor: C.teal + '12' }]}>
                <MaterialIcons name="workspace-premium" size={22} color={C.teal} />
              </View>
              <Text style={[styles.actionTitle, { color: C.text }]}>Sertifikatlar</Text>
              <Text style={{ color: C.teal, fontSize: 11, fontWeight: '700' }}>{certs.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]} onPress={() => router.push('/(tabs)/trainings')}>
              <View style={[styles.actionIcon, { backgroundColor: C.blue + '12' }]}>
                <Feather name="book-open" size={20} color={C.blue} />
              </View>
              <Text style={[styles.actionTitle, { color: C.text }]}>Təlimlər</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]} onPress={() => router.push('/documents')}>
              <View style={[styles.actionIcon, { backgroundColor: C.yellow + '12' }]}>
                <Feather name="file-text" size={20} color={C.yellow} />
              </View>
              <Text style={[styles.actionTitle, { color: C.text }]}>Sənədlər</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]} onPress={() => router.push('/(tabs)/services')}>
              <View style={[styles.actionIcon, { backgroundColor: C.green + '12' }]}>
                <Feather name="settings" size={20} color={C.green} />
              </View>
              <Text style={[styles.actionTitle, { color: C.text }]}>Xidmətlər</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.miniActions}>
            <TouchableOpacity style={[styles.miniBtn, { borderColor: C.glassBorder, backgroundColor: C.glass }]} onPress={() => router.push('/feedback')}>
              <Feather name="mail" size={16} color={C.teal} />
              <Text style={{ color: C.teal, fontSize: 13, fontWeight: '600' }}>Müraciət</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.miniBtn, { borderColor: C.glassBorder, backgroundColor: C.glass }]} onPress={() => router.navigate('/notifications')}>
              <Feather name="bell" size={16} color={C.teal} />
              <Text style={{ color: C.teal, fontSize: 13, fontWeight: '600' }}>Bildirişlər</Text>
              {unread > 0 && <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>{unread}</Text></View>}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionDot, { backgroundColor: C.teal }]} />
                <Text style={[styles.sectionTitle, { color: C.text }]}>Son sertifikatlar</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/certificates')}>
                <Text style={{ color: C.teal, fontSize: 13, fontWeight: '600' }}>Hamısı ›</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={[styles.errorBox, { borderColor: C.red + '25' }]}>
                <Feather name="alert-triangle" size={24} color={C.red} />
                <Text style={{ color: C.muted, fontSize: 14 }}>Məlumatlar yüklənə bilmədi</Text>
                <TouchableOpacity onPress={() => load()} style={[styles.retryBtn, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
                  <Text style={{ color: C.teal, fontSize: 13, fontWeight: '600' }}>Yenidən cəhd et</Text>
                </TouchableOpacity>
              </View>
            ) : certs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather name="inbox" size={32} color={C.muted} />
                <Text style={{ color: C.muted, fontSize: 14 }}>Sertifikat tapılmadı</Text>
              </View>
            ) : (
              certs.slice(0, 4).map(cert => <MiniCertCard key={cert.id} cert={cert} colors={C} />)
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  bgCircle1: {
    position: 'absolute', top: -80, right: -60,
    width: 200, height: 200, borderRadius: 100, opacity: 0.04,
  },
  bgCircle2: {
    position: 'absolute', bottom: 100, left: -40,
    width: 160, height: 160, borderRadius: 80, opacity: 0.05,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatarImg: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2,
  },
  avatarFallback: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 16, fontWeight: '800' },
  greeting: { fontSize: 12, fontWeight: '500' },
  nameText: { fontSize: 18, fontWeight: '700', marginTop: 1 },
  notifBtn: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  welcomeCard: {
    marginHorizontal: 20, marginBottom: 16,
    borderRadius: 20, overflow: 'hidden', borderWidth: 1,
  },
  wcGlow: {
    position: 'absolute', top: -30, right: -30,
    width: 120, height: 120, borderRadius: 60, opacity: 0.06,
  },
  wcContent: { padding: 20 },
  wcTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  wcLogo: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1,
  },
  wcLogoText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  wcBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1,
  },
  wcTitle: { fontSize: 20, fontWeight: '700' },
  wcSub: { fontSize: 13, marginTop: 4 },
  wcLine: { height: 1, marginVertical: 14 },
  wcStats: { flexDirection: 'row', justifyContent: 'space-around' },
  wcStatItem: { alignItems: 'center' },
  wcStatNum: { fontSize: 22, fontWeight: '800' },
  wcStatLabel: { fontSize: 11, marginTop: 3, fontWeight: '500' },
  wcStatDivider: { width: 1, height: 32 },
  alertCard: {
    marginHorizontal: 20, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  alertIconBg: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  alertLabel: { fontSize: 11, fontWeight: '600' },
  alertName: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  alertDaysBadge: {
    alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1,
  },
  alertDaysNum: { fontSize: 18, fontWeight: '800' },
  alertDaysLabel: { fontSize: 10, fontWeight: '600' },
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10, marginBottom: 12,
  },
  actionCard: {
    width: '47%' as any,
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 8,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionTitle: { fontSize: 13, fontWeight: '600' },
  miniActions: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20,
  },
  miniBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
  },
  miniBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  miniBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  certCard: {
    flexDirection: 'row',
    borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 8,
  },
  certAccent: { width: 4 },
  certContent: { flex: 1, padding: 14 },
  certTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  certBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1,
  },
  certBadgeDot: { width: 5, height: 5, borderRadius: 2.5 },
  certBadgeText: { fontSize: 11, fontWeight: '600' },
  certPercent: { fontSize: 12, fontWeight: '700' },
  certName: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  certBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1.5, marginTop: 10 },
  certBarFill: { height: 3, borderRadius: 1.5 },
  errorBox: { padding: 24, alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1 },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  emptyBox: { padding: 40, alignItems: 'center', gap: 8 },
});
