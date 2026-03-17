import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, SafeAreaView,
  Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '../store/useStore';
import { sendMessage, buildFinancialContext } from '../services/chatbot';
import { GradientBackground, GlassCard } from '../components/ui';
import AngelMascot from '../components/AngelMascot';
import colors from '../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../theme/tokens';

// Animated typing indicator dots
const PulsingDot = ({ delay }) => {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
        -1,
        false,
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, animStyle]} />;
};

const TypingIndicator = () => (
  <View style={styles.dotsRow}>
    <PulsingDot delay={0} />
    <PulsingDot delay={200} />
    <PulsingDot delay={400} />
  </View>
);

/**
 * Full-screen AI chatbot screen.
 * Accepts optional route params: { context?: string } to pre-load a goal context.
 */
export default function ChatbotScreen({ route, navigation }) {
  const context = route?.params?.context;
  const store = useStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const financialContext = buildFinancialContext(store);

  // Auto-send initial context message
  useEffect(() => {
    if (context) {
      handleSend(context);
    }
  }, []);

  const handleSend = async (overrideText) => {
    const msg = (overrideText || input).trim();
    if (!msg) return;

    const userMessage = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) setInput('');
    setLoading(true);

    // Build history for context (exclude the message we just added)
    const history = messages.slice(-6);

    try {
      const response = await sendMessage(msg, history, financialContext);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </Pressable>
            <AngelMascot size={36} glow />
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Credit Halo Angel</Text>
              <Text style={styles.headerSubtitle}>Your personal finance coach</Text>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            {/* Welcome card when no messages */}
            {messages.length === 0 && !loading && (
              <GlassCard style={styles.welcomeCard}>
                <Text style={styles.welcomeText}>
                  Hi! I'm your Credit Halo Angel. Ask me anything about your finances — budgeting, saving, debt, goals, or investing. I'm here to guide you.
                </Text>
                <View style={styles.suggestionsRow}>
                  {['How can I improve my savings rate?', 'Help me pay off debt faster', 'What credit score tips do you have?'].map((s) => (
                    <Pressable
                      key={s}
                      style={({ pressed }) => [styles.suggestion, pressed && { opacity: 0.7 }]}
                      onPress={() => handleSend(s)}
                    >
                      <Text style={styles.suggestionText}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </GlassCard>
            )}

            {messages.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.bubble,
                  m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                ]}
              >
                {m.role === 'assistant' && (
                  <View style={styles.assistantAvatar}>
                    <Ionicons name="sparkles" size={12} color={colors.primary} />
                  </View>
                )}
                <Text style={[styles.bubbleText, m.role === 'user' && styles.bubbleTextUser]}>
                  {m.content}
                </Text>
              </View>
            ))}

            {loading && (
              <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
                <TypingIndicator />
              </View>
            )}
          </ScrollView>

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask anything about your finances..."
              placeholderTextColor={colors.textTertiary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                (!input.trim() || loading) && styles.sendBtnDisabled,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              <Ionicons
                name="send"
                size={18}
                color={!input.trim() || loading ? colors.textTertiary : colors.background}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    flexShrink: 0,
  },
  headerTextBlock: { flex: 1, marginLeft: spacing.xs },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: 12, color: colors.textTertiary, marginTop: 1 },

  messageList: { flex: 1 },
  messageListContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    flexGrow: 1,
  },

  welcomeCard: { marginBottom: spacing.md },
  welcomeText: { fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md },
  suggestionsRow: { gap: spacing.xs },
  suggestion: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionText: { fontSize: 13, color: colors.primaryLight },

  bubble: {
    maxWidth: '85%',
    borderRadius: radii.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(212,168,67,0.2)',
    borderColor: colors.primary,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: GLASS_BG,
    borderColor: GLASS_BORDER,
  },
  typingBubble: { paddingVertical: 14 },
  assistantAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${colors.primary}25`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  bubbleText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTextUser: { color: colors.text },

  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryLight },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,248,230,0.06)',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: GLASS_BG },
});
