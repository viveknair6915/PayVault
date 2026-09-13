import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Link as LinkIcon,
  CheckCircle,
  Settings,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getBaseUrl, setCustomBaseUrl } from '../services/api';
import GoogleIcon from '../components/GoogleIcon';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const DEMO_ACCOUNTS = [
  {
    name: 'Vivek Nair',
    email: 'demo@payvault.com',
    password: 'User@12345',
    info: '5 Methods (All Types)',
  },
  {
    name: 'Admin',
    email: 'admin@payvault.com',
    password: 'Admin@12345',
    info: 'Full System Control',
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@payvault.com',
    password: 'User@12345',
    info: 'Bank & UPI',
  },
];

const LoginScreen = ({ navigation }) => {
  const { login, signInWithGoogleNative } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogleNative();
      success(`Welcome to PayVault, ${res.user.username}!`);
    } catch (err) {
      console.warn('Google Sign-In caught:', err);
      const msg = err.response?.data?.message || err.message || 'Google Sign-In failed.';
      error(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(getBaseUrl());

  const handleDemoSelect = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  const handleSaveServerUrl = async (overrideUrl) => {
    const target = (typeof overrideUrl === 'string' ? overrideUrl : serverUrl).trim();
    if (target) {
      setServerUrl(target);
      await setCustomBaseUrl(target);
      success(`Backend host set to: ${target}`);
      setShowServerConfig(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      success(`Welcome back, ${res.user.username}!`);
    } catch (err) {
      const isNetwork = err.message?.includes('Network Error') || err.code === 'ERR_NETWORK';
      if (isNetwork) {
        error(`Network Error: Cannot reach ${serverUrl}. Tap the host settings below to set your PC's IP.`);
        setShowServerConfig(true);
      } else {
        error(err.response?.data?.message || err.message || 'Login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topHeader}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={36} color="#ffffff" />
          </View>
          <Text style={styles.title}>Login with PayVault</Text>
          <Text style={styles.subtitle}>
            Manage your payment methods securely across Bank, UPI, Paytm, PayPal & USDT
          </Text>
        </View>

        <View style={styles.demoCard}>
          <Text style={styles.demoCardTitle}>QUICK DEMO ACCOUNTS FOR EVALUATION</Text>
          <View style={styles.demoGrid}>
            {DEMO_ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.email}
                onPress={() => handleDemoSelect(acc)}
                style={styles.demoPill}
              >
                <Text style={styles.demoPillName}>{acc.name}</Text>
                <Text style={styles.demoPillSub}>{acc.info}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formCard}>
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            style={[styles.googleBtn, isGoogleLoading && styles.googleBtnDisabled]}
            disabled={isGoogleLoading || isSubmitting}
            activeOpacity={0.85}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={styles.googleBtnContent}>
                <GoogleIcon size={18} />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in with password</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Mail size={14} color={colors.textMuted} />
              <Text style={styles.label}>Email Address</Text>
            </View>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Lock size={14} color={colors.textMuted} />
              <Text style={styles.label}>Password</Text>
            </View>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={colors.textMuted} />
                ) : (
                  <Eye size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <LogIn size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>Don't have an account yet? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>
              Create Account <ArrowRight size={12} color={colors.primary} />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trustBox}>
          <View style={styles.trustItem}>
            <LinkIcon size={14} color={colors.primary} />
            <Text style={styles.trustText}>Encrypted payment storage</Text>
          </View>
          <View style={styles.trustItem}>
            <CheckCircle size={14} color={colors.success} />
            <Text style={styles.trustText}>Strict field isolation</Text>
          </View>
          <View style={styles.trustItem}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={styles.trustText}>IDOR Guard Protected</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowServerConfig(!showServerConfig)}
          style={styles.serverConfigToggle}
        >
          <Settings size={14} color={colors.textLight} />
          <Text style={styles.serverConfigToggleText}>
            Backend: {serverUrl}
          </Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverConfigCard}>
            <Text style={styles.serverConfigTitle}>Configure Backend API Host</Text>
            <Text style={styles.serverConfigHint}>
              Select your network or type your custom server IP below:
            </Text>

            <View style={[styles.presetRow, { flexWrap: 'wrap' }]}>
              <TouchableOpacity
                onPress={() => handleSaveServerUrl('https://payvault-kudl.onrender.com/api')}
                style={[styles.presetBtn, serverUrl.includes('payvault-kudl') && styles.presetBtnActive, { flexBasis: '100%', marginBottom: 4 }]}
              >
                <Text style={[styles.presetBtnText, serverUrl.includes('payvault-kudl') && styles.presetBtnTextActive]}>
                  🌐 Cloud Production (Render — 24/7 Independent)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSaveServerUrl('http://192.168.1.29:5000/api')}
                style={[styles.presetBtn, serverUrl.includes('192.168.1.29') && styles.presetBtnActive]}
              >
                <Text style={[styles.presetBtnText, serverUrl.includes('192.168.1.29') && styles.presetBtnTextActive]}>
                  📶 Wi-Fi LAN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSaveServerUrl('http://10.0.2.2:5000/api')}
                style={[styles.presetBtn, serverUrl.includes('10.0.2.2') && styles.presetBtnActive]}
              >
                <Text style={[styles.presetBtnText, serverUrl.includes('10.0.2.2') && styles.presetBtnTextActive]}>
                  📱 Emulator
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.serverConfigInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://payvault-kudl.onrender.com/api"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => handleSaveServerUrl()}
              style={styles.serverConfigBtn}
            >
              <Text style={styles.serverConfigBtnText}>Apply Custom Server URL</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  topHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.float,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  demoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  demoCardTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  demoPill: {
    width: '31%',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    alignItems: 'center',
  },
  demoPillName: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  demoPillSub: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.card,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textMain,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: typography.sizes.sm,
    color: colors.textMain,
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    ...shadows.float,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerPrompt: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  registerLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  trustBox: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trustText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  serverConfigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.lg,
  },
  serverConfigToggleText: {
    fontSize: 10,
    color: colors.textLight,
  },
  serverConfigCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  serverConfigTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: 4,
  },
  serverConfigHint: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
    marginBottom: spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  presetBtnText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  presetBtnTextActive: {
    color: colors.primary,
  },
  serverConfigInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: typography.sizes.xs,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  serverConfigBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  serverConfigBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  googleBtnDisabled: {
    opacity: 0.6,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  googleBtnText: {
    color: colors.textMain,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
});

export default LoginScreen;
