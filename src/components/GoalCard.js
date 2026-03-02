import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { globalStyles, colors } from '../theme/styles';

const GoalCard = ({ goal, onComplete }) => {
  if (!goal || goal.text == null) return null;
  return (
    <Card
      containerStyle={{
        backgroundColor: colors.card,
        borderRadius: 12,
        borderColor: colors.cardBorder,
        marginBottom: 12,
      }}
    >
      <Text style={[globalStyles.title, { fontSize: 18 }]}>{goal.text}</Text>
      <Button
        title="I completed this goal"
        buttonStyle={{
          backgroundColor: colors.primary,
          borderRadius: 8,
          marginTop: 12,
        }}
        titleStyle={{ color: colors.text, fontWeight: '600' }}
        onPress={() => onComplete(goal.id)}
      />
    </Card>
  );
};

export default GoalCard;
