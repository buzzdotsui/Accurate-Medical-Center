import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Placeholder Screens
import LoginScreen from './src/screens/LoginScreen';
import PatientDashboard from './src/screens/patient/Dashboard';
import DoctorDashboard from './src/screens/doctor/Dashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          
          {/* Patient Flows */}
          <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
          
          {/* Doctor Flows */}
          <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
