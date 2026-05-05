import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './app/index';
import ScannerScreen from './app/scanner';
import { colors } from './constants/theme';
import { ShoppingProvider } from './context/ShoppingContext';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ShoppingProvider>
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
                  headerTintColor: colors.primary,
                  headerStyle: { backgroundColor: colors.surface },
                  headerShadowVisible: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ShoppingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
