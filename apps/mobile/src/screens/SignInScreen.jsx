import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '@profitpath/shared';
import { LuxeInput, LuxeButtonPrimary } from '../components/ui';

export default function SignInScreen({ navigation }) {
  const { colors } = useTheme();
  const { signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email.trim().toLowerCase(), password);
      // Navigation will happen automatically via auth state change
    } catch (error) {
      Alert.alert('Sign In Failed', error.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={[styles.logoProfit, { color: colors.textPrimary, fontFamily: colors.fontDisplay }]}>Profit</Text>
              <Text style={[styles.logoPath, { color: colors.accentGold, fontFamily: colors.fontDisplay }]}>Path</Text>
            </View>
            <Text style={[styles.tagline, { color: colors.textMuted, fontFamily: colors.fontMono }]}>
              Track your trading journey
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: colors.fontDisplay }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: colors.fontMono }]}>
              Sign in to continue
            </Text>

            <LuxeInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            <LuxeInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              editable={!isLoading}
            />

            <LuxeButtonPrimary
              title="Sign In"
              onPress={handleSignIn}
              disabled={isLoading}
              loading={isLoading}
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary, fontFamily: colors.fontMono }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={isLoading}>
              <Text style={[styles.linkText, { color: colors.accentGold, fontFamily: colors.fontMono }]}>Sign Up</Text>
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
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoRow: { flexDirection: 'row', alignItems: 'baseline' },
  logoProfit: { fontSize: 32, fontWeight: '500', letterSpacing: -0.5 },
  logoPath: { fontSize: 32, fontWeight: '500', letterSpacing: -0.5 },
  tagline: { fontSize: 14, marginTop: 8 },
  form: { marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '500', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  button: { marginTop: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
