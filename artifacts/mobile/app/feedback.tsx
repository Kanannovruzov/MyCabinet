import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Animated,
  TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { useTheme } from '@/context/theme';
import OceanWaves from '@/components/ocean-waves';

const TOPICS = [
  { label: 'Sertifikat məsələsi', icon: 'award' },
  { label: 'Texniki problem', icon: 'tool' },
  { label: 'Ödəniş məsələsi', icon: 'credit-card' },
  { label: 'Məlumat yenilənməsi', icon: 'refresh-cw' },
  { label: 'Digər', icon: 'more-horizontal' },
];

export default function FeedbackScreen() {
  const { colors } = useTheme();
  const C = colors;
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Xəta', 'Mətn daxil edin');
      return;
    }
    setSending(true);
    try {
      const res = await api.feedbackSend(topic, message.trim());
      if (res.ok) {
        Alert.alert('Göndərildi', 'Müraciətiniz qəbul edildi. Tezliklə cavab veriləcək.', [
          { text: 'Tamam', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Xəta', res.msg || 'Göndərmək mümkün olmadı');
      }
    } catch {
      Alert.alert('Xəta', 'Şəbəkə xətası. Yenidən cəhd edin.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.bgGlow1, { backgroundColor: C.teal }]} />
      <View style={[styles.bgGlow2, { backgroundColor: C.blue }]} />
      <OceanWaves color={C.teal} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={[styles.topbar, { borderBottomColor: C.divider }]}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.glass, borderColor: C.glassBorder }]}>
              <Feather name="arrow-left" size={22} color={C.teal} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: C.text }]}>Əks-Əlaqə</Text>
            <View style={[styles.tealPill, { borderColor: C.glassBorder, backgroundColor: C.glass }]}>
              <View style={[styles.pillDot, { backgroundColor: C.teal }]} />
              <Text style={[styles.pillText, { color: C.teal }]}>DDLA</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.infoBox, { backgroundColor: C.glass, borderColor: C.glassBorder }]}>
              <Feather name="info" size={16} color={C.teal} />
              <Text style={[styles.infoText, { color: C.muted }]}>
                Müraciətiniz Dövlət Dəniz və Liman Agentliyinə göndəriləcək.
                Gündə 1 müraciət mümkündür.
              </Text>
            </View>

            <Text style={[styles.label, { color: C.text }]}>Mövzu</Text>
            <View style={styles.topicsGrid}>
              {TOPICS.map(t => (
                <TouchableOpacity
                  key={t.label}
                  style={[
                    styles.topicBtn,
                    { borderColor: C.cardBorder, backgroundColor: C.cardBg },
                    topic === t.label && { borderColor: C.teal, backgroundColor: C.teal + '15' },
                  ]}
                  onPress={() => setTopic(t.label)}
                  activeOpacity={0.75}
                >
                  <Feather name={t.icon as any} size={14} color={topic === t.label ? C.teal : C.muted} />
                  <Text style={[styles.topicText, { color: C.muted }, topic === t.label && { color: C.teal, fontWeight: '600' }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: C.text }]}>Müraciət mətni</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: C.cardBg, borderColor: C.cardBorder, color: C.text }]}
              placeholder="Müraciətinizi buraya yazın..."
              placeholderTextColor={C.muted}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: C.muted }]}>{message.length}/2000</Text>

            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#000" />
                  <Text style={styles.sendBtnText}>Göndər</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  title: { fontSize: 20, fontWeight: '700', flex: 1 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600' },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
  },
  topicText: { fontSize: 13, fontWeight: '500' },
  textInput: {
    borderRadius: 14, borderWidth: 1,
    fontSize: 14, lineHeight: 22,
    padding: 16, minHeight: 140,
  },
  charCount: { fontSize: 11, textAlign: 'right' },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#00d4c8',
    borderRadius: 14, paddingVertical: 16,
    shadowColor: '#00d4c8', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
