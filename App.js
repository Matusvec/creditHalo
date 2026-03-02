import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import colors from './src/theme/colors';

function AppContent() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { useStore } = await import('./src/store/useStore');
        await useStore.getState().hydrate();
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <View style={styles.splash}>
        <Text style={{ color: '#333', padding: 20, textAlign: 'center' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const AppNavigator = require('./src/navigation/AppNavigator').default;
  const { useStore } = require('./src/store/useStore');
  const isLoggedIn = useStore.getState().isLoggedIn;

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator initialRoute={isLoggedIn ? 'Main' : 'Loading'} />
    </>
  );
}

export default function App() {
  return <AppContent />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
