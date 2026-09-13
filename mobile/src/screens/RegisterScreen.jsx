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
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleIcon from '../components/GoogleIcon';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const RegisterScreen = ({ navigation }) => {
  const { register, signInWithGoogleNative } = useAuth();
  const { success, error } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const errs = {};
    if (!username.trim() || username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters long.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await register(username.trim(), email.trim(), password);
      success(`Welcome to PayVault, ${res.user.username}!`);
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Registration failed.');
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={colors.textMain} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.topHeader}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={36} color="#ffffff" />
          </View>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>
            Join PayVault to manage multiple payment profiles securely
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Google Sign-Up Button */}
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

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or register with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Username */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <User size={14} color={colors.textMuted} />
              <Text style={styles.label}>Full Name / Username</Text>
            </View>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              value={username}
              onChangeText={(val) => {
                setUsername(val);
                if (errors.username) setErrors((prev) => ({ ...prev, username: null }));
              }}
              placeholder="e.g. Vivek Nair"
              placeholderTextColor={colors.textLight}
              autoCapitalize="words"
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Mail size={14} color={colors.textMuted} />
              <Text style={styles.label}>Email Address</Text>
            </View>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="name@example.com"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Lock size={14} color={colors.textMuted} />
              <Text style={styles.label}>Password (min 6 characters)</Text>
            </View>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="Create a strong password"
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
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Lock size={14} color={colors.textMuted} />
              <Text style={styles.label}>Confirm Password</Text>
            </View>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              placeholder="Confirm password"
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showPassword}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <UserPlus size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
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
    paddingHorizontal: spacing.md,
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
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
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
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.danger,
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginPrompt: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  loginLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
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

export default RegisterScreen;
