import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { 
  styles, 
  Button, 
  Input, 
  Card 
} from '../../components/common';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = (): boolean => {
    let valid = true;
    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleLogin = async () => {
    clearError();
    if (!validateForm()) return;

    try {
      await login(email, password);
      // Navigation will be handled by the auth state listener in App.tsx
    } catch {
      // Error is already set in the store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Accurate Medical Center</Text>
          <Text style={styles.headerSubtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.content}>
          <Card>
            <Input
              label="Email Address"
              placeholder="doctor@accuratemedical.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError}
              disabled={isLoading}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              error={passwordError}
              disabled={isLoading}
            />
            {error && (
              <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#fef2f2', borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' }}>
                <Text style={{ color: '#991b1b', fontSize: 14 }}>{error}</Text>
              </View>
            )}
            <Button 
              title={isLoading ? 'Signing in...' : 'Sign In'} 
              onPress={handleLogin} 
              loading={isLoading}
              disabled={isLoading}
            />
          </Card>

          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>
              Don&apos;t have an account?{' '}
              <Text 
                style={{ color: '#0f766e', fontWeight: '600' }}
                onPress={() => navigation.navigate('Register')}
              >
                Register as Patient
              </Text>
            </Text>
          </View>

          <View style={{ marginTop: 16, padding: 16, backgroundColor: '#f0fdfa', borderRadius: 12, borderWidth: 1, borderColor: '#99f6e4' }}>
            <Text style={{ color: '#0f766e', fontSize: 13, textAlign: 'center' }}>
              <Text style={{ fontWeight: '600' }}>Demo Credentials:</Text>{' '}
              admin@accuratemedical.com / Admin123! (Admin)
              {'\n'}doctor@accuratemedical.com / Doctor123! (Doctor)
              {'\n'}patient@accuratemedical.com / Patient123! (Patient)
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;