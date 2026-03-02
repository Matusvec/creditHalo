import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useStore } from './src/store/useStore';
import AppNavigator from './src/navigation/AppNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from './src/theme/colors';

export default function App() {
  const [ready, setReady] = useState(false);
  const { hydrate, isLoggedIn } = useStore();

  useEffect(() => {
    hydrate().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator initialRoute={isLoggedIn ? 'Main' : 'Loading'} />
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});