import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useStore } from '../store/useStore';
import { LEARNING_MODULES } from '../data/mockModules';
import StreakTracker from '../components/StreakTracker';
import AngelMascot from '../components/AngelMascot';
import { globalStyles, colors } from '../theme/styles';

export default function LearnScreen({ navigation }) {
  const { completedLessons, streak } = useStore();

  const totalLessons = LEARNING_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const completed = completedLessons.length;
  const progress = totalLessons > 0 ? completed / totalLessons : 0;

  return (
    <ScrollView style={globalStyles.container}>
      <StreakTracker streak={streak} />
      <View style={globalStyles.card}>
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Earn Your Wings</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              flex: 1,
              height: 12,
              backgroundColor: colors.goldLight,
              borderRadius: 6,
              overflow: 'hidden',
              marginRight: 12,
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: colors.primary,
                borderRadius: 6,
              }}
            />
          </View>
          <Text style={globalStyles.subtitle}>{completed}/{totalLessons}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ marginRight: 4 }}>👼</Text>
          {[...Array(Math.min(completed, 5))].map((_, i) => (
            <Text key={i} style={{ marginRight: 2 }}>🪶</Text>
          ))}
        </View>
      </View>

      <Text style={[globalStyles.title, { marginBottom: 12 }]}>Learning Modules</Text>
      {LEARNING_MODULES.map((mod) => {
        const modCompleted = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;
        const total = mod.lessons.length;
        return (
          <TouchableOpacity
            key={mod.id}
            style={globalStyles.card}
            onPress={() => navigation.navigate('LessonDetail', { moduleId: mod.id })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, marginRight: 12 }}>{mod.icon}</Text>
                <View>
                  <Text style={[globalStyles.title, { fontSize: 18, marginBottom: 0 }]}>{mod.title}</Text>
                  <Text style={globalStyles.subtitle}>{modCompleted}/{total} lessons</Text>
                </View>
              </View>
              <Text style={{ fontSize: 20, color: colors.primary }}>
                {modCompleted === total ? '✓' : '→'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
