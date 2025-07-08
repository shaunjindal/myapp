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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { theme } from '../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';


export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please check your credentials.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="storefront" size={48} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue shopping</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
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
                placeholder="Enter your password"
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

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              disabled={loading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '800' as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500' as any,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
    marginTop: -theme.spacing.sm,
  },
  forgotPasswordText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    fontWeight: '600' as any,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  footerText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
    fontWeight: '500' as any,
  },
  footerLink: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '700' as any,
  },

}); 