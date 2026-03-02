import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useStore } from '../store/useStore';
import { LEARNING_MODULES, getQuizForLesson } from '../data/mockModules';
import { globalStyles, colors } from '../theme/styles';

export default function LessonDetailScreen({ route, navigation }) {
  const { moduleId } = route.params || {};
  const { completedLessons, addCompletedLesson, incrementStreak, persist } = useStore();
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [quizVisible, setQuizVisible] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);

  const module = LEARNING_MODULES.find((m) => m.id === moduleId);
  if (!module) return null;

  const lessons = module.lessons;
  const currentLesson = lessons[selectedLessonIndex] || lessons[0];
  const isCompleted = completedLessons.includes(currentLesson?.id);
  const quiz = currentLesson ? getQuizForLesson(currentLesson.id) : [];

  const handleTakeQuiz = () => setQuizVisible(true);

  const handleAnswerSelect = (idx) => setSelectedAnswer(idx);

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return;
    const q = quiz[currentQ];
    const correct = selectedAnswer === q.correct;
    if (correct) {
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
        }, 800);
      }
    } else {
      Alert.alert('Not quite!', 'Try again.', [{ text: 'OK' }]);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
        {lessons.map((l, i) => (
          <TouchableOpacity
            key={l.id}
            onPress={() => setSelectedLessonIndex(i)}
            style={{
              padding: 8,
              marginRight: 8,
              marginBottom: 8,
              backgroundColor: selectedLessonIndex === i ? colors.primary : colors.card,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>
              {completedLessons.includes(l.id) ? '✓ ' : ''}Lesson {i + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {currentLesson && (
        <>
          <View style={globalStyles.card}>
            <Text style={[globalStyles.title, { fontSize: 20 }]}>{currentLesson.title}</Text>
            <Text style={{ color: colors.text, lineHeight: 24, marginTop: 12 }}>
              {currentLesson.content}
            </Text>
            {isCompleted ? (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 48, marginBottom: 8 }}>✅</Text>
                <Text style={globalStyles.subtitle}>Lesson completed!</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[globalStyles.button, { marginTop: 24 }]}
                onPress={handleTakeQuiz}
              >
                <Text style={globalStyles.buttonText}>Take a Quiz</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      <Modal visible={quizVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={[
              globalStyles.card,
              {
                backgroundColor: colors.white,
                maxHeight: '80%',
              },
            ]}
          >
            {quizComplete ? (
              <View style={{ alignItems: 'center', padding: 24 }}>
                <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
                <Text style={[globalStyles.title, { fontSize: 24 }]}>Quiz Passed!</Text>
                <Text style={globalStyles.subtitle}>You earned a feather!</Text>
              </View>
            ) : quiz[currentQ] ? (
              <>
                <Text style={[globalStyles.title, { marginBottom: 16 }]}>
                  {quiz[currentQ].q}
                </Text>
                {quiz[currentQ].a.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      backgroundColor:
                        selectedAnswer === idx ? colors.goldLight : colors.background,
                      borderRadius: 8,
                      borderWidth: selectedAnswer === idx ? 2 : 0,
                      borderColor: colors.primary,
                    }}
                    onPress={() => handleAnswerSelect(idx)}
                  >
                    <Text style={{ color: colors.text }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[globalStyles.button, { marginTop: 16 }]}
                  onPress={handleQuizSubmit}
                  disabled={selectedAnswer === null}
                >
                  <Text style={globalStyles.buttonText}>
                    {currentQ < quiz.length - 1 ? 'Next' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
