import {
  InterTight_400Regular,
  InterTight_500Medium,
  InterTight_600SemiBold,
  InterTight_700Bold,
} from '@expo-google-fonts/inter-tight';
import { Fraunces_500Medium, useFonts } from '@expo-google-fonts/fraunces';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/context/AppContext';
import ActiveListScreen from '@/screens/active-list';
import CameraScreen from '@/screens/camera';
import FinishTripScreen from '@/screens/finish-trip';
import HistoryScreen from '@/screens/history';
import StartTripScreen from '@/screens/start-trip';
import TripDetailScreen from '@/screens/trip-detail';
import { darkColors, lightColors } from '@/theme';
import { type RootStackParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LightNavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: lightColors.bg, card: lightColors.surface, border: lightColors.hairline, text: lightColors.ink, primary: lightColors.accent, notification: lightColors.pop },
};

const DarkNavTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: darkColors.bg, card: darkColors.surface, border: darkColors.hairline, text: darkColors.ink, primary: darkColors.accent, notification: darkColors.pop },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    InterTight_700Bold,
  });
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer theme={isDark ? DarkNavTheme : LightNavTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="History" component={HistoryScreen} />
              <Stack.Screen name="StartTrip" component={StartTripScreen} />
              <Stack.Screen name="ActiveList" component={ActiveListScreen} />
              <Stack.Screen
                name="Camera"
                component={CameraScreen}
                options={{ presentation: 'fullScreenModal' }}
              />
              <Stack.Screen name="FinishTrip" component={FinishTripScreen} />
              <Stack.Screen name="TripDetail" component={TripDetailScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
