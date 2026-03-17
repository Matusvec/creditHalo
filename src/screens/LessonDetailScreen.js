import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { LEARNING_MODULES, getQuizForLesson } from '../data/mockModules';
import {
  GradientBackground,
  GlassCard,
  GlassModal,
  AnimatedButton,
  AnimatedText,
} from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useHaptic } from '../hooks/useHaptic';
import colors from '../theme/colors';
import { radii, shadows, spacing, typography } from '../theme/tokens';

// ---------------------------------------------------------------------------
// AnswerChip — quiz answer row with gold selection state and shake animation
// ---------------------------------------------------------------------------

/**
 * Single quiz answer option. Highlights gold on selection and exposes a shake
 * shared value that the parent can trigger via withSequence on wrong answers.
 */
const AnswerChip = ({ label, index, isSelected, onSelect, shakeValue }) => {
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  return (
    <Animated.View style={shakeStyle}>
      <Pressable
        onPress={() => onSelect(index)}
        style={[
          styles.answerChip,
          isSelected ? styles.answerChipSelected : styles.answerChipIdle,
        ]}
      >
        <Text style={[styles.answerText, isSelected && styles.answerTextSelected]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// LessonDetailScreen
// ---------------------------------------------------------------------------

/**
 * Premium liquid-glass lesson detail screen.
 * - Glass chip selector row for lesson navigation
 * - GlassCard for lesson content
 * - GlassModal for the quiz with animated answer chips
 * - Shake animation on wrong answer (no Alert)
 * - Gold AnimatedText celebration on quiz pass
 */
export default function LessonDetailScreen({ route, navigation }) {
  const { moduleId } = route.params || {};
  const { completedLessons, addCompletedLesson, incrementStreak, persist } = useStore();
  const { trigger } = useHaptic();

  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [quizVisible, setQuizVisible] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);

  // Staggered entrance animations
  const chipRowAnim = useEntranceAnimation(0);
  const cardAnim = useEntranceAnimation(120);

  // Pre-allocate shake shared values for up to 4 answer options
  const shake0 = useSharedValue(0);
  const shake1 = useSharedValue(0);
  const shake2 = useSharedValue(0);
  const shake3 = useSharedValue(0);
  const shakeValues = [shake0, shake1, shake2, shake3];

  const module = LEARNING_MODULES.find((m) => m.id === moduleId);
  if (!module) return null;

  const lessons = module.lessons;
  const currentLesson = lessons[selectedLessonIndex] || lessons[0];
  const isCompleted = completedLessons.includes(currentLesson?.id);
  const quiz = currentLesson ? getQuizForLesson(currentLesson.id) : [];

  /**
   * Fire a rapid left-right shake on the given answer chip index.
   */
  const triggerShake = useCallback(
    (idx) => {
      const sv = shakeValues[idx];
      if (!sv) return;
      sv.value = withSequence(
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-4, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleTakeQuiz = () => {
    trigger('light');
    setQuizVisible(true);
  };

  const handleAnswerSelect = (idx) => {
    trigger('light');
    setSelectedAnswer(idx);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return;
    const q = quiz[currentQ];
    const correct = selectedAnswer === q.correct;

    if (correct) {
      trigger('success');
      if (currentQ < quiz.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedAnswer(null);
      } else {
        addCompletedLesson(currentLesson.id);
        incrementStreak();
        persist();
        setQuizComplete(true);
        setTimeout(() => {
          setQuizVisible(false);
          setCurrentQ(0);
          setSelectedAnswer(null);
          setQuizComplete(false);
          navigation.goBack();
        }, 1400);
      }
    } else {
      trigger('error');
      triggerShake(selectedAnswer);
    }
  };

  const handleModalClose = () => {
    setQuizVisible(false);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setQuizComplete(false);
  };

  const handleLessonSelect = (i) => {
    trigger('light');
    setSelectedLessonIndex(i);
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson selector chip row */}
        <Animated.View style={[styles.chipRow, chipRowAnim]}>
          {lessons.map((l, i) => {
            const active = selectedLessonIndex === i;
            const done = completedLessons.includes(l.id);
            return (
              <Pressable
                key={l.id}
                onPress={() => handleLessonSelect(i)}
                style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {done ? '✓ ' : ''}Lesson {i + 1}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        {/* Lesson content */}
        {currentLesson && (
          <Animated.View style={cardAnim}>
            <GlassCard>
              <Text style={styles.moduleLabel}>{module.title.toUpperCase()}</Text>
              <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
              <Text style={styles.lessonBody}>{currentLesson.content}</Text>

              {isCompleted ? (
                <View style={styles.completedBlock}>
                  <Text style={styles.completedIcon}>✓</Text>
                  <Text style={styles.completedLabel}>Lesson completed!</Text>
                </View>
              ) : (
                <AnimatedButton
                  title="Take a Quiz"
                  variant="primary"
                  onPress={handleTakeQuiz}
                  style={styles.quizButton}
                />
              )}
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      {/* Quiz modal */}
      <GlassModal visible={quizVisible} onClose={handleModalClose}>
        {quizComplete ? (
          /* ---- Pass celebration ---- */
          <View style={styles.celebrationBlock}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <AnimatedText style={styles.celebrationTitle} delay={0}>
              Quiz Passed!
            </AnimatedText>
            <AnimatedText style={styles.celebrationSub} delay={120}>
              You earned a feather!
            </AnimatedText>
          </View>
        ) : quiz[currentQ] ? (
          /* ---- Active question ---- */
          <View>
            <Text style={styles.progressLabel}>
              Question {currentQ + 1} of {quiz.length}
            </Text>
            <Text style={styles.questionText}>{quiz[currentQ].q}</Text>

            <View style={styles.answersBlock}>
              {quiz[currentQ].a.map((opt, idx) => (
                <AnswerChip
                  key={idx}
                  label={opt}
                  index={idx}
                  isSelected={selectedAnswer === idx}
                  onSelect={handleAnswerSelect}
                  shakeValue={shakeValues[idx]}
                />
              ))}
            </View>

            <AnimatedButton
              title={currentQ < quiz.length - 1 ? 'Next' : 'Submit'}
              variant="primary"
              onPress={handleQuizSubmit}
              disabled={selectedAnswer === null}
              style={styles.submitButton}
            />
          </View>
        ) : null}
      </GlassModal>
    </GradientBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
  },

  // ---- Lesson chip row ----
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  chipGlass: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.goldGlow,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.background,
    fontWeight: '700',
  },

  // ---- Lesson card ----
  moduleLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.primaryMuted,
    marginBottom: 6,
  },
  lessonTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 14,
  },
  lessonBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
  },

  // ---- Completed state ----
  completedBlock: {
    marginTop: 28,
    alignItems: 'center',
    gap: 6,
  },
  completedIcon: {
    fontSize: 40,
    color: colors.success,
  },
  completedLabel: {
    ...typography.callout,
    color: colors.success,
    fontWeight: '600',
  },

  // ---- Quiz button ----
  quizButton: {
    marginTop: 28,
  },

  // ---- Quiz modal ----
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.primaryMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  questionText: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 20,
    lineHeight: 28,
  },
  answersBlock: {
    gap: 10,
    marginBottom: 4,
  },

  // ---- Answer chips ----
  answerChip: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  answerChipIdle: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  answerChipSelected: {
    backgroundColor: 'rgba(212, 168, 67, 0.18)',
    borderColor: colors.primary,
    ...shadows.goldGlow,
  },
  answerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  answerTextSelected: {
    color: colors.primaryLight,
    fontWeight: '600',
  },

  // ---- Submit button ----
  submitButton: {
    marginTop: 20,
  },

  // ---- Celebration ----
  celebrationBlock: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 4,
  },
  celebrationTitle: {
    ...typography.title,
    color: colors.primary,
    fontWeight: '700',
  },
  celebrationSub: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
