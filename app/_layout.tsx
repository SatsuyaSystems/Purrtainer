import { Colors } from '@/constants/Colors';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.DeepDarkPurple,
          },
          headerTintColor: Colors.PureWhite,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: Colors.DeepDarkPurple,
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Environments' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
