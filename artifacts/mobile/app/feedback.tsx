import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/services/api';

const BG    = '#060d1a';
const BG2   = '#0a1628';
const TEAL  = '#00d4c8';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.45)';
const RED   = '#EF4444';

const TOPICS = [
  'Sertifikat məsələsi',
  'Texniki problem',
  'Ödəniş məsələsi',
  'Məlumat yenilənməsi',
  'Digər',
];

export default function FeedbackScreen() {
  const [topic, setTopic]     = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Əks-Əlaqə</Text>
          <View style={styles.tealPill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>DDLA</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Müraciətiniz Dövlət Dəniz və Liman Agentliyinə göndəriləcək.
              Gündə 1 müraciət mümkündür.
            </Text>
          </View>

          <Text style={styles.label}>Mövzu</Text>
          <View style={styles.topicsGrid}>
            {TOPICS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.topicBtn, topic === t && styles.topicBtnActive]}
                onPress={() => setTopic(t)}
                activeOpacity={0.75}
              >
                <Text style={[styles.topicText, topic === t && styles.topicTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Müraciət mətni</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Müraciətinizi buraya yazın..."
            placeholderTextColor={MUTED}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={2000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{message.length}/2000</Text>

          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color={WHITE} size="small" />
            ) : (
              <Text style={styles.sendBtnText}>Göndər</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,200,0.1)',
    gap: 10,
  },
  backBtn:  { padding: 4 },
  backText: { color: TEAL, fontSize: 28, fontWeight: '300', lineHeight: 28 },
  title:    { color: '#FFFFFF', fontSize: 20, fontWeight: '700', flex: 1 },
  tealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(0,212,200,0.3)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(0,212,200,0.06)',
  },
  pillDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  pillText: { color: TEAL, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  content: { padding: 20, gap: 16, paddingBottom: 40 },

  infoBox: {
    backgroundColor: 'rgba(0,212,200,0.06)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,212,200,0.2)',
    padding: 14,
  },
  infoText: { color: MUTED, fontSize: 13, lineHeight: 20 },

  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  topicBtnActive: {
    borderColor: TEAL,
    backgroundColor: 'rgba(0,212,200,0.12)',
  },
  topicText:       { color: MUTED, fontSize: 13, fontWeight: '500' },
  topicTextActive: { color: TEAL, fontWeight: '600' },

  textInput: {
    backgroundColor: BG2,
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(0,212,200,0.15)',
    color: '#FFFFFF',
    fontSize: 14, lineHeight: 22,
    padding: 16,
    minHeight: 140,
  },
  charCount: { color: MUTED, fontSize: 11, textAlign: 'right' },

  sendBtn: {
    backgroundColor: TEAL,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: TEAL, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText:     { color: '#000', fontSize: 16, fontWeight: '700' },
});
