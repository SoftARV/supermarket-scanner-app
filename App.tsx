import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Fraunces_500Medium, useFonts } from '@expo-google-fonts/fraunces';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './app/index';
import ScannerScreen from './app/scanner';
import { lightColors } from './constants/theme';
import { AppProvider } from './context/AppContext';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({ Fraunces_500Medium });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{
                  title: 'Scan price tag',
                  headerBackTitle: 'Back',
                  headerTintColor: lightColors.accent,
                  headerStyle: { backgroundColor: lightColors.surface },
                  headerShadowVisible: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
