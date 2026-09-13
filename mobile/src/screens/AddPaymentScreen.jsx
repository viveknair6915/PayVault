import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import PaymentForm from '../components/PaymentForm';
import Header from '../components/Header';
import { createPayment } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import { colors, typography, spacing } from '../styles/theme';

const AddPaymentScreen = ({ navigation }) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (paymentData) => {
    setIsSubmitting(true);
    try {
      const res = await createPayment(paymentData);
      success(res.message || 'Payment method saved successfully!');
      navigation.navigate('PaymentsTab');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add payment method.';
      error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeading}>Add Payment Method</Text>
          <Text style={styles.pageSubheading}>
            Select your preferred payment channel and enter your account information.
          </Text>
        </View>

        <PaymentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  pageHeader: {
    marginBottom: spacing.md,
  },
  pageHeading: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  pageSubheading: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
});

export default AddPaymentScreen;
