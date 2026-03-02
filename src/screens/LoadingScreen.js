import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { signInWithGoogle } from '../services/auth';
import AngelMascot from '../components/AngelMascot';
import { colors } from '../theme/colors';

export default function LoadingScreen({ navigation }) {
  const { user, setUser, hydrate, persist } = useStore();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      persist();
      navigation.replace('Main');
    }
  }, [user]);

  const handleSignIn = async () => {
    const userData = await signInWithGoogle();
    setUser(userData);
    persist();
    navigation.replace('Main');
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.gold, colors.background]}
      style={styles.container}
    >
      <View style={styles.content}>
        <AngelMascot size={120} style={styles.angel} />
        <Text style={styles.title}>Credit Halo</Text>
        <Text style={styles.subtitle}>Build your financial future</Text>
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign up with Google</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  angel: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
