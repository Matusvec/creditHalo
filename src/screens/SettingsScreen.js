import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useStore } from '../store/useStore';
import { signOut } from '../services/auth';
import { openPlaidLink } from '../services/plaid';
import { globalStyles, colors } from '../theme/styles';

export default function SettingsScreen({ navigation }) {
  const {
    user,
    bankLinked,
    setBankLinked,
    setUser,
    notificationsEnabled,
    setNotificationsEnabled,
    persist,
  } = useStore();

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    persist();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Loading' }],
    });
  };

  const handleLinkBank = async () => {
    await openPlaidLink(
      () => {
        setBankLinked(true);
        persist();
      },
      () => {}
    );
  };

  const handleNotificationsToggle = (value) => {
    setNotificationsEnabled(value);
    persist();
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.card}>
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Profile</Text>
        <Text style={globalStyles.subtitle}>{user?.email || 'Not signed in'}</Text>
        <Text style={globalStyles.subtitle}>{user?.name || ''}</Text>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 12 }]}
          onPress={handleLogout}
        >
          <Text style={globalStyles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.card}>
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Link Bank Account</Text>
        <TouchableOpacity
          style={[globalStyles.button, { marginTop: 12 }]}
          onPress={handleLinkBank}
        >
          <Text style={globalStyles.buttonText}>
            {bankLinked ? 'Bank Linked ✓' : 'Link Bank Account'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[globalStyles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleNotificationsToggle}
          trackColor={{ false: colors.textLight, true: colors.primary }}
          thumbColor={colors.white}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Legal</Text>
        <TouchableOpacity style={{ paddingVertical: 8 }}>
          <Text style={globalStyles.subtitle}>Terms & Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 8 }}>
          <Text style={globalStyles.subtitle}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 8 }}>
          <Text style={globalStyles.subtitle}>Disclosures</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
