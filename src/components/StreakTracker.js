import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles, colors } from '../theme/styles';

const StreakTracker = ({ streak }) => {
  return (
    <View style={[globalStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}>
      <Text style={{ fontSize: 32, marginRight: 12 }}>🔥</Text>
      <View>
        <Text style={[globalStyles.title, { fontSize: 20, marginBottom: 0 }]}>{streak}</Text>
        <Text style={globalStyles.subtitle}>Day Streak</Text>
      </View>
    </View>
  );
};

export default StreakTracker;
