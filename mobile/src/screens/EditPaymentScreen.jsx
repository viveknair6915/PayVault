import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import PaymentForm from '../components/PaymentForm';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchPaymentById, updatePayment } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import { colors, typography, spacing } from '../styles/theme';

const EditPaymentScreen = ({ route, navigation }) => {
  const { id } = route.params || {};
  const { success, error } = useToast();

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPayment = async () => {
      if (!id) {
        error('Invalid payment ID');
        navigation.goBack();
        return;
      }

      try {
        const res = await fetchPaymentById(id);
        if (res.success && res.data) {
          setPaymentData(res.data);
        } else {
          error('Payment method not found.');
          navigation.goBack();
        }
      } catch (err) {
        error(err.response?.data?.message || 'Could not load payment method.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [id, navigation, error]);

  const handleSubmit = async (updatedData) => {
    setIsSubmitting(true);
    try {
      const res = await updatePayment(id, updatedData);
      success(res.message || 'Payment method updated successfully!');
      navigation.goBack();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update payment method.';
      error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header showBack={true} title="Edit Payment" />

      {loading ? (
        <LoadingSpinner text="Loading payment parameters..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeading}>Edit Payment Method</Text>
            <Text style={styles.pageSubheading}>
              Update account parameters or seamlessly change payment type.
            </Text>
          </View>

          <PaymentForm
            initialData={paymentData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </ScrollView>
      )}
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

export default EditPaymentScreen;
