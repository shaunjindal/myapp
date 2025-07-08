import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';

import { theme } from '../src/styles/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return null;
  };

  const handleRegister = async () => {
    console.log('🔐 RegisterScreen: Starting registration process...');
    console.log('🔐 RegisterScreen: Form data:', { firstName, lastName, email, autoLogin });
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Password Error', passwordError);
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 RegisterScreen: Calling register function...');
      const fullName = `${firstName} ${lastName}`;
      console.log('🔐 RegisterScreen: Prepared fullName:', fullName);
      const success = await register(fullName, email, password, autoLogin);
      
      console.log('🔐 RegisterScreen: Registration result:', success);
      
      if (success) {
        console.log('🔐 RegisterScreen: Registration successful, autoLogin:', autoLogin);
        if (autoLogin) {
          console.log('🔐 RegisterScreen: Navigating to home page...');
          router.replace('/(tabs)/home');
        } else {
          console.log('🔐 RegisterScreen: Navigating to login page...');
          router.replace('/login');
        }
        return; // Important: return here to prevent further execution
      } else {
        console.log('❌ RegisterScreen: Registration failed');
        Alert.alert('Registration Failed', 'Unable to create account. Please check your information and try again.');
      }
    } catch (error) {
      console.error('❌ RegisterScreen: Registration error:', error);
      
      // Check if error has a specific message
      if (error && typeof error === 'object' && 'message' in error) {
        Alert.alert('Registration Error', String(error.message));
      } else {
        Alert.alert('Registration Error', 'An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <View style={styles.form}>
              <Input
                label="First Name"
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                size="lg"
                required
              />
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                size="lg"
                required
              />
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                size="lg"
                required
              />
              <View style={styles.passwordContainer}>
                <Input
                  label="Password"
                  placeholder="Enter your password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  size="lg"
                  required
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.gray[500]}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.passwordContainer}>
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  size="lg"
                  required
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.gray[500]}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setAutoLogin(!autoLogin)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, autoLogin && styles.checkboxChecked]}>
                  {autoLogin && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.background} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Automatically sign me in after registration
                </Text>
              </TouchableOpacity>

              <Button
                title={loading ? 'Creating Account...' : 'Create Account'}
                onPress={handleRegister}
                disabled={loading}
                size="lg"
                fullWidth
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  footerLink: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary[400],
    borderRadius: 4,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  checkboxLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    flex: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: theme.typography.sizes.sm + theme.spacing.sm + (56 / 2) - 10, // label height + margin + center of input - half icon height
    zIndex: 1,
  },
}); 