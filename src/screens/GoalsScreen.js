import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
let ConfettiCannon;
try {
  ConfettiCannon = require('react-native-confetti-cannon').default;
} catch (e) {
  ConfettiCannon = null;
}
import { useStore } from '../store/useStore';
import { sendMessage } from '../services/chatbot';
import { GOAL_EXAMPLES } from '../data/mockGoals';
import GoalCard from '../components/GoalCard';
import AngelMascot from '../components/AngelMascot';
import { globalStyles, colors } from '../theme/styles';

export default function GoalsScreen() {
  const { goals, addGoal, completeGoal, persist } = useStore();
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const confettiRef = useRef(null);

  const handleAddGoal = () => {
    const text = newGoalText.trim();
    if (text && text.length <= 100) {
      addGoal(text);
      persist();
      setNewGoalText('');
      setGoalModalVisible(false);
    }
  };

  const handleCompleteGoal = (id) => {
    try {
      confettiRef.current?.start?.();
    } catch (e) {
      Alert.alert('🎉', 'Goal completed! Great job!');
    }
    setTimeout(() => {
      completeGoal(id);
      persist();
    }, 1500);
  };

  const handleSendChat = async () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setChatInput('');
    setChatLoading(true);
    const response = await sendMessage(msg);
    setChatLoading(false);
    setChatMessages((prev) => [...prev, { role: 'assistant', content: response }]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={globalStyles.container}>
        <TouchableOpacity
          style={[globalStyles.button, { marginBottom: 16 }]}
          onPress={() => setGoalModalVisible(true)}
        >
          <Text style={globalStyles.buttonText}>Set your new goal</Text>
        </TouchableOpacity>

        <Text style={[globalStyles.title, { marginBottom: 12 }]}>Your Goals</Text>
        {(!goals || goals.length === 0) ? (
          <View style={globalStyles.card}>
            <Text style={globalStyles.subtitle}>No goals yet. Set your first goal above!</Text>
          </View>
        ) : (
          (goals || [])
            .filter((g) => g && g.text != null)
            .map((goal) => (
              <GoalCard key={goal.id} goal={goal} onComplete={handleCompleteGoal} />
            ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: 50,
          borderWidth: 2,
          borderColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => setChatbotVisible(true)}
      >
        <AngelMascot size={48} />
        <Text style={{ fontSize: 10, color: colors.text, marginTop: 4, textAlign: 'center' }}>
          Ask me how
        </Text>
      </TouchableOpacity>

      {ConfettiCannon && (
        <ConfettiCannon
          ref={(r) => (confettiRef.current = r)}
          count={100}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          colors={[colors.primary, colors.gold, colors.background]}
        />
      )}

      <Modal visible={goalModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { backgroundColor: colors.white }]}>
            <Text style={globalStyles.title}>Set New Goal</Text>
            <Text style={[globalStyles.subtitle, { marginBottom: 12 }]}>Examples:</Text>
            {GOAL_EXAMPLES.slice(0, 4).map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={{ padding: 8, marginBottom: 4, backgroundColor: colors.background, borderRadius: 8 }}
                onPress={() => setNewGoalText(ex)}
              >
                <Text style={{ color: colors.text }}>{ex}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={[globalStyles.input, { marginTop: 12, marginBottom: 12 }]}
              placeholder="Write your goal (max 100 chars)"
              value={newGoalText}
              onChangeText={setNewGoalText}
              maxLength={100}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12 }}>
              {newGoalText.length}/100
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[globalStyles.button, { flex: 1, marginRight: 8 }]} onPress={handleAddGoal}>
                <Text style={globalStyles.buttonText}>Add Goal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonSecondary, { flex: 1 }]}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={globalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={chatbotVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={globalStyles.title}>Ask me how to achieve your goal</Text>
            <TouchableOpacity onPress={() => setChatbotVisible(false)}>
              <Text style={globalStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, marginBottom: 16 }}>
            {chatMessages.length === 0 && (
              <View style={globalStyles.card}>
                <Text style={globalStyles.subtitle}>
                  Hi! I'm your Credit Halo angel. Ask me anything about achieving your financial goals.
                </Text>
              </View>
            )}
            {chatMessages.map((m, i) => (
              <View
                key={i}
                style={[
                  globalStyles.card,
                  {
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: m.role === 'user' ? colors.primary : colors.card,
                    maxWidth: '85%',
                  },
                ]}
              >
                <Text style={{ color: colors.text }}>{m.content}</Text>
              </View>
            ))}
            {chatLoading && (
              <View style={globalStyles.card}>
                <Text style={globalStyles.subtitle}>Thinking...</Text>
              </View>
            )}
          </ScrollView>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              style={[globalStyles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Ask a question..."
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSendChat}
            />
            <TouchableOpacity style={globalStyles.button} onPress={handleSendChat}>
              <Text style={globalStyles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
