import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Landmark,
  Smartphone,
  AtSign,
  Send,
  Coins,
  CheckCircle2,
} from 'lucide-react-native';
import { validatePaymentInput } from '../utils/paymentValidator';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const PAYMENT_TYPES = [
  { id: 'Bank', label: 'Bank Transfer', icon: Landmark },
  { id: 'Paytm', label: 'Paytm', icon: Smartphone },
  { id: 'UPI', label: 'UPI', icon: AtSign },
  { id: 'PayPal', label: 'PayPal', icon: Send },
  { id: 'USDT', label: 'USDT (Crypto)', icon: Coins },
];

const PaymentForm = ({ initialData = null, onSubmit, isSubmitting = false }) => {
  const [paymentType, setPaymentType] = useState(initialData?.paymentType || 'Bank');
  const [formData, setFormData] = useState({
    bankName: initialData?.bankName || '',
    branchName: initialData?.branchName || '',
    accountHolderName: initialData?.accountHolderName || '',
    accountNumber: initialData?.accountNumber || '',
    ifscCode: initialData?.ifscCode || '',
    paytmNumber: initialData?.paytmNumber || '',
    upiId: initialData?.upiId || '',
    paypalEmail: initialData?.paypalEmail || '',
    usdtAddress: initialData?.usdtAddress || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setPaymentType(initialData.paymentType || 'Bank');
      setFormData({
        bankName: initialData.bankName || '',
        branchName: initialData.branchName || '',
        accountHolderName: initialData.accountHolderName || '',
        accountNumber: initialData.accountNumber || '',
        ifscCode: initialData.ifscCode || '',
        paytmNumber: initialData.paytmNumber || '',
        upiId: initialData.upiId || '',
        paypalEmail: initialData.paypalEmail || '',
        usdtAddress: initialData.usdtAddress || '',
      });
    }
  }, [initialData]);

  const handleTypeChange = (newType) => {
    setPaymentType(newType);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'ifscCode' ? value.toUpperCase() : value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors, cleanData } = validatePaymentInput({
      paymentType,
      ...formData,
    });

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(cleanData);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionLabel}>Select Payment Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
      >
        {PAYMENT_TYPES.map((t) => {
          const Icon = t.icon;
          const isActive = paymentType === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => handleTypeChange(t.id)}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Icon
                size={16}
                color={isActive ? '#ffffff' : colors.textMuted}
              />
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {paymentType === 'Bank' && (
        <View style={styles.fieldsBlock}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Bank Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.bankName && styles.inputError]}
              value={formData.bankName}
              onChangeText={(val) => handleInputChange('bankName', val)}
              placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
              placeholderTextColor={colors.textLight}
            />
            {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Branch Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.branchName && styles.inputError]}
              value={formData.branchName}
              onChangeText={(val) => handleInputChange('branchName', val)}
              placeholder="e.g. Koramangala Branch, Bangalore"
              placeholderTextColor={colors.textLight}
            />
            {errors.branchName && <Text style={styles.errorText}>{errors.branchName}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Account Holder Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.accountHolderName && styles.inputError]}
              value={formData.accountHolderName}
              onChangeText={(val) => handleInputChange('accountHolderName', val)}
              placeholder="e.g. Vivek Nair"
              placeholderTextColor={colors.textLight}
            />
            {errors.accountHolderName && (
              <Text style={styles.errorText}>{errors.accountHolderName}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Account Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.accountNumber && styles.inputError]}
              value={formData.accountNumber}
              onChangeText={(val) => handleInputChange('accountNumber', val)}
              placeholder="e.g. 501002348912"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              maxLength={18}
            />
            {errors.accountNumber && (
              <Text style={styles.errorText}>{errors.accountNumber}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              IFSC Code <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.ifscCode && styles.inputError]}
              value={formData.ifscCode}
              onChangeText={(val) => handleInputChange('ifscCode', val)}
              placeholder="e.g. HDFC0001234"
              placeholderTextColor={colors.textLight}
              autoCapitalize="characters"
              maxLength={11}
            />
            {errors.ifscCode && <Text style={styles.errorText}>{errors.ifscCode}</Text>}
            <Text style={styles.helpText}>
              11-character code provided by your bank (e.g. HDFC0001234).
            </Text>
          </View>
        </View>
      )}

      {paymentType === 'Paytm' && (
        <View style={styles.fieldsBlock}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Paytm Registered Mobile Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.paytmNumber && styles.inputError]}
              value={formData.paytmNumber}
              onChangeText={(val) => handleInputChange('paytmNumber', val)}
              placeholder="e.g. 9876543210"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              maxLength={13}
            />
            {errors.paytmNumber && (
              <Text style={styles.errorText}>{errors.paytmNumber}</Text>
            )}
            <Text style={styles.helpText}>
              The phone number linked to your Paytm wallet or bank account.
            </Text>
          </View>
        </View>
      )}

      {paymentType === 'UPI' && (
        <View style={styles.fieldsBlock}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              UPI ID / VPA <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.upiId && styles.inputError]}
              value={formData.upiId}
              onChangeText={(val) => handleInputChange('upiId', val)}
              placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.upiId && <Text style={styles.errorText}>{errors.upiId}</Text>}
            <Text style={styles.helpText}>
              Your Virtual Payment Address (e.g. mobile@upi, name@okaxis).
            </Text>
          </View>
        </View>
      )}

      {paymentType === 'PayPal' && (
        <View style={styles.fieldsBlock}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              PayPal Registered Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.paypalEmail && styles.inputError]}
              value={formData.paypalEmail}
              onChangeText={(val) => handleInputChange('paypalEmail', val)}
              placeholder="e.g. yourname@example.com"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.paypalEmail && (
              <Text style={styles.errorText}>{errors.paypalEmail}</Text>
            )}
            <Text style={styles.helpText}>
              The email address associated with your PayPal account.
            </Text>
          </View>
        </View>
      )}

      {paymentType === 'USDT' && (
        <View style={styles.fieldsBlock}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              USDT Wallet Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.usdtAddress && styles.inputError]}
              value={formData.usdtAddress}
              onChangeText={(val) => handleInputChange('usdtAddress', val)}
              placeholder="e.g. T9yD14Nj9j7... (TRC20) or 0x8a9e7F... (BEP20)"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
            />
            {errors.usdtAddress && (
              <Text style={styles.errorText}>{errors.usdtAddress}</Text>
            )}
            <Text style={styles.helpText}>
              Supported formats: TRC20 (starts with T) or BEP20/ERC20 (starts with 0x).
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <CheckCircle2 size={18} color="#ffffff" />
            <Text style={styles.submitBtnText}>
              {initialData ? 'Update Payment Method' : 'Save Payment Method'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.card,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  pillsContainer: {
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: spacing.xs,
    ...shadows.sm,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  fieldsBlock: {
    marginTop: spacing.sm,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textMain,
    marginBottom: 6,
  },
  required: {
    color: colors.danger,
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
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.danger,
    marginTop: 4,
  },
  helpText: {
    fontSize: 11,
    color: colors.textLight,
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
    marginTop: spacing.md,
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
});

export default PaymentForm;
