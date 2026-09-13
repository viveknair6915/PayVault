import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Plus, CreditCard } from 'lucide-react-native';
import { fetchPayments, deletePayment } from '../services/paymentService';
import PaymentCard from '../components/PaymentCard';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Header from '../components/Header';
import { useToast } from '../context/ToastContext';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const FILTER_TABS = ['All', 'Bank', 'Paytm', 'UPI', 'PayPal', 'USDT'];

const PaymentsScreen = ({ navigation }) => {
  const { success, error } = useToast();

  const [payments, setPayments] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPayments = useCallback(async (tab = selectedTab) => {
    try {
      const res = await fetchPayments(tab);
      if (res.success) {
        setPayments(res.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [error, selectedTab]);

  useEffect(() => {
    loadPayments(selectedTab);
  }, [loadPayments, selectedTab]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments(selectedTab);
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setLoading(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deletePayment(paymentToDelete._id);
      if (res.success) {
        success('Payment method removed successfully.');
        setPayments((prev) => prev.filter((p) => p._id !== paymentToDelete._id));
        setPaymentToDelete(null);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete payment method.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenTitle}>Manage Payments</Text>
          <Text style={styles.screenSub}>
            Manage your saved payment methods securely.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddPaymentTab')}
          style={styles.addBtn}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.addBtnText}>Add Method</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabChange(tab)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingSpinner text="Fetching payment methods..." />
      ) : payments.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.emptyIconCircle}>
            <CreditCard size={36} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No payment methods yet</Text>
          <Text style={styles.emptyDesc}>
            {selectedTab === 'All'
              ? 'Add your first payment method to easily manage and withdraw funds.'
              : `You haven't saved any ${selectedTab} payment methods yet.`}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddPaymentTab')}
            style={styles.emptyAddBtn}
          >
            <Plus size={18} color="#ffffff" />
            <Text style={styles.emptyAddBtnText}>Add Payment Method</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              onDeleteClick={(p) => setPaymentToDelete(p)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Delete Payment Method"
        message={`Are you sure you want to delete this ${paymentToDelete?.paymentType || ''} payment method? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPaymentToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  screenTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  screenSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  addBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  filterWrap: {
    paddingVertical: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: spacing.xs,
    ...shadows.sm,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 350,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
    ...shadows.float,
  },
  emptyAddBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
});

export default PaymentsScreen;
