import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Modal, FlatList,
  ActivityIndicator, RefreshControl, TouchableOpacity, Image, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { api, CertItem, NotifItem } from '@/services/api';

const BG     = '#060d1a';
const BG2    = '#0a1628';
const TEAL   = '#00d4c8';
const WHITE  = '#FFFFFF';
const MUTED  = 'rgba(255,255,255,0.45)';
const RED    = '#EF4444';
const YELLOW = '#EAB308';
const GREEN  = '#22C55E';
const BLUE   = '#0057B7';

function certColor(percent: number, unlimited: boolean) {
  if (unlimited) return TEAL;
  if (percent > 50) return GREEN;
  if (percent > 20) return YELLOW;
  return RED;
}

function MiniCertCard({ cert }: { cert: CertItem }) {
  const unlimited = cert.days_label === 'Müddətsiz';
  const color = certColor(cert.percent, unlimited);

  return (
    <View style={styles.certCard}>
      <View style={[styles.certAccent, { backgroundColor: color }]} />
      <View style={styles.certContent}>
        <View style={styles.certTop}>
          <View style={[styles.certStatusDot, { backgroundColor: color, shadowColor: color }]} />
          <Text style={[styles.certDaysText, { color }]}>
            {unlimited ? 'Müddətsiz' : `${cert.days_left} gün`}
          </Text>
        </View>
        <Text style={styles.certName} numberOfLines={2}>{cert.cert_name}</Text>
        <Text style={styles.certCode}>{cert.code}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${Math.min(cert.percent, 100)}%` as any, backgroundColor: color }]} />
        </View>
        <View style={styles.certDates}>
          <Text style={styles.certDateText}>{cert.start}</Text>
          <Text style={styles.certDateArrow}>→</Text>
          <Text style={styles.certDateText}>{cert.end}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { pin, nameAz, photoUrl, setAuth } = useAuth();
  const [certs, setCerts]           = useState<CertItem[]>([]);
  const [notifs, setNotifs]         = useState<NotifItem[]>([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotifItem | null>(null);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const [certsRes, notifRes, profileRes] = await Promise.all([
        api.certificates(),
        api.notifications().catch(() => ({ ok: false, items: [], unread: 0 })),
        api.profile().catch(() => ({ ok: false, item: null })),
      ]);
      if (certsRes.ok) setCerts(certsRes.items);
      else setError(true);
      if (notifRes.ok) {
        setNotifs(notifRes.items || []);
        setUnread(notifRes.unread);
      }
      if (profileRes.ok && profileRes.item) {
        const p = profileRes.item;
        const shortNameAz = p.name_azD || p.name_az;
        const shortNameEn = p.name_enD || p.name_en;
        const id = p.unikal || p.colID;
        setProfileName(shortNameAz);
        if (id) {
          setProfilePhoto(`https://seafarer.ddla.gov.az/image/${id}`);
        }
        if (pin) {
          setAuth(pin, {
            nameAz: shortNameAz,
            nameEn: shortNameEn,
            seamanId: String(id),
            photoUrl: id ? `https://seafarer.ddla.gov.az/image/${id}` : undefined,
          });
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

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
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={TEAL} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative bg */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={TEAL} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/(tabs)/profile')}>
              {userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.onlineDot} />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Xoş gəldiniz 👋</Text>
              <Text style={styles.nameText}>{displayName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifs(true)}>
            <Text style={styles.notifIcon}>🔔</Text>
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          <View style={styles.wcGlow} />
          <View style={styles.wcContent}>
            <View style={styles.wcTop}>
              <View style={styles.wcLogo}>
                <Text style={styles.wcLogoText}>DDLA</Text>
              </View>
              <View style={styles.wcBadge}>
                <View style={styles.wcBadgeDot} />
                <Text style={styles.wcBadgeText}>Aktiv</Text>
              </View>
            </View>
            <Text style={styles.wcTitle}>Dənizçi Kabineti</Text>
            <Text style={styles.wcSub}>Sertifikat və sənədlərinizi idarə edin</Text>
            <View style={styles.wcLine} />
            <View style={styles.wcStats}>
              <View style={styles.wcStatItem}>
                <Text style={styles.wcStatNum}>{certs.length}</Text>
                <Text style={styles.wcStatLabel}>Sertifikat</Text>
              </View>
              <View style={styles.wcStatDivider} />
              <View style={styles.wcStatItem}>
                <Text style={[styles.wcStatNum, { color: GREEN }]}>{activeCerts.length}</Text>
                <Text style={styles.wcStatLabel}>Aktiv</Text>
              </View>
              <View style={styles.wcStatDivider} />
              <View style={styles.wcStatItem}>
                <Text style={[styles.wcStatNum, { color: expiredCerts > 0 ? RED : MUTED }]}>{expiredCerts}</Text>
                <Text style={styles.wcStatLabel}>Bitmiş</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alert — next expiry */}
        {nextExpiry && (
          <View style={styles.alertCard}>
            <View style={styles.alertLeft}>
              <View style={[styles.alertIconBg, nextExpiry.days_left! < 30 ? { backgroundColor: 'rgba(239,68,68,0.12)' } : {}]}>
                <Text style={styles.alertEmoji}>⏰</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertLabel}>Ən yaxın bitmə</Text>
                <Text style={styles.alertName} numberOfLines={1}>{nextExpiry.cert_name}</Text>
              </View>
            </View>
            <View style={[styles.alertDaysBadge, nextExpiry.days_left! < 30 ? { borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.08)' } : {}]}>
              <Text style={[styles.alertDaysNum, { color: nextExpiry.days_left! < 30 ? RED : YELLOW }]}>
                {nextExpiry.days_left}
              </Text>
              <Text style={styles.alertDaysLabel}>gün</Text>
            </View>
          </View>
        )}

        {/* Quick actions grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/certificates')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,212,200,0.1)' }]}>
              <Text style={{ fontSize: 22 }}>📜</Text>
            </View>
            <Text style={styles.actionTitle}>Sertifikatlar</Text>
            <Text style={styles.actionCount}>{certs.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/trainings')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,87,183,0.12)' }]}>
              <Text style={{ fontSize: 22 }}>🎓</Text>
            </View>
            <Text style={styles.actionTitle}>Təlimlər</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/documents')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(234,179,8,0.1)' }]}>
              <Text style={{ fontSize: 22 }}>📄</Text>
            </View>
            <Text style={styles.actionTitle}>Sənədlər</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/services')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </View>
            <Text style={styles.actionTitle}>Xidmətlər</Text>
          </TouchableOpacity>
        </View>

        {/* Mini action row */}
        <View style={styles.miniActions}>
          <TouchableOpacity style={styles.miniBtn} onPress={() => router.push('/feedback')}>
            <Text style={{ fontSize: 16 }}>✉️</Text>
            <Text style={styles.miniBtnText}>Müraciət</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.miniBtn} onPress={() => router.navigate('/notifications')}>
            <Text style={{ fontSize: 16 }}>🔔</Text>
            <Text style={styles.miniBtnText}>Bildirişlər</Text>
            {unread > 0 && <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>{unread}</Text></View>}
          </TouchableOpacity>
        </View>

        {/* Recent certs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Son sertifikatlar</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/certificates')}>
              <Text style={styles.seeAll}>Hamısı ›</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={styles.errorText}>Məlumatlar yüklənə bilmədi</Text>
              <TouchableOpacity onPress={() => load()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Yenidən cəhd et</Text>
              </TouchableOpacity>
            </View>
          ) : certs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 32 }}>📭</Text>
              <Text style={styles.emptyText}>Sertifikat tapılmadı</Text>
            </View>
          ) : (
            certs.slice(0, 4).map(cert => <MiniCertCard key={cert.id} cert={cert} />)
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Notification list modal */}
      <Modal visible={showNotifs} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
          <View style={nStyles.sheetHeader}>
            <Text style={nStyles.sheetTitle}>Bildirişlər</Text>
            {unread > 0 && <Text style={nStyles.unreadLabel}>{unread} oxunmamış</Text>}
            <TouchableOpacity onPress={() => setShowNotifs(false)} style={nStyles.closeBtn}>
              <Text style={nStyles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          {notifs.length === 0 ? (
            <View style={nStyles.emptyWrap}>
              <Text style={{ fontSize: 28 }}>🔕</Text>
              <Text style={nStyles.emptyText}>Bildiriş yoxdur</Text>
            </View>
          ) : (
            <FlatList
              data={notifs}
              keyExtractor={i => String(i.id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
              renderItem={({ item }) => {
                const isUnread = item.is_read === 0;
                const isExpanded = selectedNotif?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[nStyles.notifItem, isUnread && nStyles.notifItemUnread]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isUnread) {
                        api.markRead(item.id).catch(() => {});
                        setNotifs(prev => prev.map(n => n.id === item.id ? { ...n, is_read: 1 } : n));
                        setUnread(prev => Math.max(0, prev - 1));
                      }
                      setSelectedNotif(isExpanded ? null : item);
                    }}
                  >
                    {isUnread && <View style={nStyles.dot} />}
                    <View style={{ flex: 1 }}>
                      <Text style={[nStyles.notifTitle, isUnread && { color: WHITE }]}>{item.title}</Text>
                      {isExpanded && !!item.body ? (
                        <Text style={nStyles.notifBodyFull}>{item.body}</Text>
                      ) : (
                        !!item.body && <Text style={nStyles.notifBody} numberOfLines={2}>{item.body}</Text>
                      )}
                      <Text style={nStyles.notifDate}>{item.created_at}</Text>
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 18 }}>{isExpanded ? '‹' : '›'}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { alignItems: 'center', justifyContent: 'center' },

  bgCircle1: {
    position: 'absolute', top: -80, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: TEAL, opacity: 0.04,
  },
  bgCircle2: {
    position: 'absolute', bottom: 100, left: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: BLUE, opacity: 0.05,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatarImg: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: TEAL,
  },
  avatarFallback: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0,212,200,0.12)',
    borderWidth: 2, borderColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { color: TEAL, fontSize: 16, fontWeight: '800' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: GREEN,
    borderWidth: 2.5, borderColor: BG,
  },
  greeting: { color: MUTED, fontSize: 12, fontWeight: '500' },
  nameText: { color: WHITE, fontSize: 18, fontWeight: '700', marginTop: 1 },
  notifBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(0,212,200,0.06)',
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 20 },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: RED, borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: WHITE, fontSize: 10, fontWeight: '700' },

  welcomeCard: {
    marginHorizontal: 20, marginTop: 8,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.15)',
    backgroundColor: BG2,
  },
  wcGlow: {
    position: 'absolute', top: -40, right: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: TEAL, opacity: 0.06,
  },
  wcContent: { padding: 18 },
  wcTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  wcLogo: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: TEAL,
    backgroundColor: 'rgba(0,212,200,0.08)',
  },
  wcLogoText: { color: TEAL, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  wcBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  wcBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  wcBadgeText: { color: GREEN, fontSize: 11, fontWeight: '600' },
  wcTitle: { color: WHITE, fontSize: 18, fontWeight: '700' },
  wcSub: { color: MUTED, fontSize: 12, marginTop: 4 },
  wcLine: { height: 1, backgroundColor: 'rgba(0,212,200,0.1)', marginVertical: 14 },
  wcStats: { flexDirection: 'row', alignItems: 'center' },
  wcStatItem: { flex: 1, alignItems: 'center' },
  wcStatNum: { color: WHITE, fontSize: 24, fontWeight: '800' },
  wcStatLabel: { color: MUTED, fontSize: 11, marginTop: 2 },
  wcStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.08)' },

  alertCard: {
    marginHorizontal: 20, marginTop: 14, padding: 14,
    backgroundColor: 'rgba(234,179,8,0.05)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  alertIconBg: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(234,179,8,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  alertEmoji: { fontSize: 18 },
  alertLabel: { color: MUTED, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  alertName: { color: WHITE, fontSize: 13, fontWeight: '600', marginTop: 2 },
  alertDaysBadge: {
    alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)', backgroundColor: 'rgba(234,179,8,0.08)',
  },
  alertDaysNum: { fontSize: 18, fontWeight: '800' },
  alertDaysLabel: { color: MUTED, fontSize: 10, fontWeight: '600' },

  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, gap: 10, marginTop: 18,
  },
  actionCard: {
    width: '47%' as any, backgroundColor: BG2,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,212,200,0.08)',
    padding: 16, gap: 8,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionTitle: { color: WHITE, fontSize: 13, fontWeight: '600' },
  actionCount: { color: MUTED, fontSize: 11 },

  miniActions: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginTop: 14,
  },
  miniBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  miniBtnText: { color: MUTED, fontSize: 12, fontWeight: '600' },
  miniBadge: {
    backgroundColor: RED, borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  miniBadgeText: { color: WHITE, fontSize: 9, fontWeight: '700' },

  section: { marginTop: 22, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 0.8, shadowRadius: 4,
  },
  sectionTitle: { color: WHITE, fontSize: 16, fontWeight: '700' },
  seeAll: { color: TEAL, fontSize: 13, fontWeight: '600' },

  certCard: {
    flexDirection: 'row', backgroundColor: BG2,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,212,200,0.08)',
    marginBottom: 10, overflow: 'hidden',
  },
  certAccent: { width: 4 },
  certContent: { flex: 1, padding: 14 },
  certTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  certStatusDot: {
    width: 8, height: 8, borderRadius: 4,
    shadowOpacity: 0.8, shadowRadius: 4,
  },
  certDaysText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  certName: { color: WHITE, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  certCode: { color: MUTED, fontSize: 11, marginTop: 3 },
  progressTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2, marginTop: 10,
  },
  progressBar: { height: 4, borderRadius: 2 },
  certDates: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
  },
  certDateText: { color: MUTED, fontSize: 11 },
  certDateArrow: { color: 'rgba(255,255,255,0.2)', fontSize: 11 },

  errorBox: {
    padding: 24, backgroundColor: 'rgba(239,68,68,0.06)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center', gap: 10,
  },
  errorEmoji: { fontSize: 28 },
  errorText: { color: RED, fontSize: 13, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  retryText: { color: RED, fontSize: 13, fontWeight: '600' },

  emptyBox: { padding: 40, alignItems: 'center', gap: 8 },
  emptyText: { color: MUTED, fontSize: 14 },
});

const nStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: BG2,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingHorizontal: 16, paddingBottom: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginTop: 10, marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,200,0.1)',
  },
  sheetTitle: { color: WHITE, fontSize: 18, fontWeight: '700', flex: 1 },
  unreadLabel: { color: TEAL, fontSize: 12, fontWeight: '600' },
  closeBtn: { padding: 4 },
  closeBtnText: { color: MUTED, fontSize: 18, fontWeight: '300' },
  emptyWrap: { padding: 40, alignItems: 'center', gap: 8 },
  emptyText: { color: MUTED, fontSize: 14 },
  notifItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  notifItemUnread: {
    backgroundColor: 'rgba(0,212,200,0.05)',
    borderColor: 'rgba(0,212,200,0.15)',
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 1, shadowRadius: 4,
  },
  notifTitle: { color: MUTED, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  notifBody: { color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 18, marginTop: 3 },
  notifBodyFull: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 22, marginTop: 8 },
  notifDate: { color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 4 },
});
