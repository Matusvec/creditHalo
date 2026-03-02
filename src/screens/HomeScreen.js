import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { openPlaidLink } from '../services/plaid';
import AngelMascot from '../components/AngelMascot';
import { globalStyles, colors } from '../theme/styles';

export default function HomeScreen({ navigation }) {
  const { user, bankLinked, setBankLinked, persist } = useStore();
  const [linking, setLinking] = useState(false);

  const handleLinkBank = async () => {
    if (bankLinked) return;
    setLinking(true);
    await openPlaidLink(
      () => {
        setBankLinked(true);
        persist();
        setLinking(false);
      },
      () => setLinking(false)
    );
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View>
          <Text style={globalStyles.title}>Welcome, {user?.name || 'User'}!</Text>
          <Text style={globalStyles.subtitle}>Your angel is here to guide you.</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[globalStyles.card, { flexDirection: 'row', alignItems: 'center' }]}>
        <AngelMascot size={60} />
        <Text style={{ flex: 1, marginLeft: 12, color: colors.text }}>
          Link your bank account for personalized insights!
        </Text>
      </View>

      <TouchableOpacity
        style={[globalStyles.button, { marginBottom: 24 }]}
        onPress={handleLinkBank}
        disabled={bankLinked || linking}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {linking ? (
            <ActivityIndicator color={colors.text} style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="link" size={24} color={colors.text} style={{ marginRight: 8 }} />
          )}
          <Text style={globalStyles.buttonText}>
            {bankLinked ? 'Bank Account Linked ✓' : linking ? 'Linking...' : 'Link Bank Account'}
          </Text>
        </View>
      </TouchableOpacity>

      <Text style={[globalStyles.subtitle, { marginBottom: 12 }]}>
        Tap the tabs below to explore Learn, Community, Goals, and Insights.
      </Text>
    </ScrollView>
  );
}
