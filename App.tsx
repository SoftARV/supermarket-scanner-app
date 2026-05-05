import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Fraunces_500Medium, useFonts } from '@expo-google-fonts/fraunces';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './context/AppContext';
import { darkColors, lightColors } from './constants/theme';
import { RootStackParamList } from './types';

// Screens
import HistoryScreen from './app/history';
import StartTripScreen from './app/start-trip';
import ActiveListScreen from './app/active-list';
import CameraScreen from './app/camera';
import FinishTripScreen from './app/finish-trip';
import TripDetailScreen from './app/trip-detail';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wire React Navigation's theme to our palette so transition backgrounds match
const LightNavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: lightColors.bg, card: lightColors.surface, border: lightColors.hairline, text: lightColors.ink, primary: lightColors.accent, notification: lightColors.pop },
};

const DarkNavTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: darkColors.bg, card: darkColors.surface, border: darkColors.hairline, text: darkColors.ink, primary: darkColors.accent, notification: darkColors.pop },
};

export default function App() {
  const [fontsLoaded] = useFonts({ Fraunces_500Medium });
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
