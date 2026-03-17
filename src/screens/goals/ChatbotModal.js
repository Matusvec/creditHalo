import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { GlassCard, AnimatedButton, GlassModal } from '../../components/ui';
import AngelMascot from '../../components/AngelMascot';
import { sendMessage } from '../../services/chatbot';
import colors from '../../theme/colors';
import { radii, spacing, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

const PulsingDot = ({ delay }) => {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, false);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, animStyle]} />;
};

const PulsingDots = () => (
  <View style={styles.dotsRow}>
    <PulsingDot delay={0} />
    <PulsingDot delay={200} />
    <PulsingDot delay={400} />
  </View>
);

export default function ChatbotModal({ visible, onClose }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChat = async () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const response = await sendMessage(msg);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <GlassModal visible={visible} onClose={onClose} fullScreen>
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderLeft}>
          <AngelMascot size={36} glow />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.chatTitle}>Credit Halo Angel</Text>
            <Text style={styles.chatSubtitle}>Ask me anything about your goals</Text>
          </View>
        </View>
        <AnimatedButton title="Close" onPress={onClose} variant="ghost" />
      </View>

      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatScrollContent} showsVerticalScrollIndicator={false}>
        {chatMessages.length === 0 && (
          <GlassCard>
            <Text style={styles.chatWelcome}>Hi! I'm your Credit Halo angel. Ask me anything about achieving your financial goals — I'm here to guide you every step of the way.</Text>
          </GlassCard>
        )}
        {chatMessages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
            <Text style={styles.bubbleText}>{m.content}</Text>
          </View>
        ))}
        {chatLoading && (
          <View style={[styles.bubble, styles.bubbleAssistant, { paddingVertical: 14, paddingHorizontal: 18 }]}>
            <PulsingDots />
          </View>
        )}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput style={styles.chatInput} placeholder="Ask a question..." placeholderTextColor={colors.textTertiary} value={chatInput} onChangeText={setChatInput} onSubmitEditing={handleSendChat} returnKeyType="send" />
        <AnimatedButton title="Send" onPress={handleSendChat} variant="primary" disabled={!chatInput.trim() || chatLoading} style={styles.sendBtn} />
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: GLASS_BORDER },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  chatTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  chatSubtitle: { fontSize: 12, color: colors.textTertiary, marginTop: 1 },
  chatScroll: { flex: 1 },
  chatScrollContent: { paddingBottom: spacing.lg, gap: 10 },
  chatWelcome: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  bubble: { maxWidth: '85%', borderRadius: radii.lg, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: 'rgba(212,168,67,0.2)', borderColor: colors.primary },
  bubbleAssistant: { alignSelf: 'flex-start', backgroundColor: GLASS_BG, borderColor: GLASS_BORDER },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryLight },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: GLASS_BORDER },
  chatInput: { flex: 1, backgroundColor: 'rgba(255,248,230,0.06)', borderWidth: 1, borderColor: GLASS_BORDER, borderRadius: radii.md, paddingVertical: 10, paddingHorizontal: spacing.md, fontSize: 14, color: colors.text },
  sendBtn: { paddingVertical: 10, paddingHorizontal: 16 },
});
