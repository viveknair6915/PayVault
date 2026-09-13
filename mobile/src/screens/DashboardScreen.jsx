import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  CreditCard,
  PlusCircle,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchPayments } from '../services/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';
import Header from '../components/Header';
import { formatDate } from '../utils/formatters';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const DashboardScreen = ({ navigation }) => {
  const { user, isAdmin, logout, refreshUser } = useAuth();
  const { success } = useToast();

  const [paymentCount, setPaymentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      await refreshUser();
      const res = await fetchPayments();
      if (res.success) {
        setPaymentCount(res.count);
      }
    } catch {
      // Keep UI steady
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogoutConfirm = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of PayVault?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            success('Logged out successfully');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Profile Hub" />

      {loading ? (
        <LoadingSpinner text="Loading profile details..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {/* Profile Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            <Text style={styles.userName}>{user?.username || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            {/* Badges */}
            <View style={styles.badgesRow}>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={13} color={colors.success} />
                <Text style={styles.verifiedText}>Verified Account</Text>
              </View>

              {isAdmin && (
                <View style={styles.adminBadge}>
                  <ShieldAlert size={13} color="#b45309" />
                  <Text style={styles.adminText}>Administrator</Text>
                </View>
              )}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{paymentCount}</Text>
                <Text style={styles.statLabel}>Saved Payment Methods</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { fontSize: typography.sizes.sm }]}>
                  {formatDate(user?.createdAt)}
                </Text>
                <Text style={styles.statLabel}>Member Since</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Title */}
          <Text style={styles.sectionHeader}>Quick Actions</Text>

          {/* Action: Manage Payments */}
          <TouchableOpacity
            onPress={() => navigation.navigate('PaymentsTab')}
            style={styles.actionCard}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: colors.primaryLight }]}>
              <CreditCard size={20} color={colors.primary} />
            </View>
            <View style={styles.actionDetails}>
              <Text style={styles.actionTitle}>Manage Payment Portfolio</Text>
              <Text style={styles.actionSub}>View, copy, edit, or remove payment methods</Text>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>

          {/* Action: Add Payment */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddPaymentTab')}
            style={styles.actionCard}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: colors.successLight }]}>
              <PlusCircle size={20} color={colors.success} />
            </View>
            <View style={styles.actionDetails}>
              <Text style={styles.actionTitle}>Add New Payment Channel</Text>
              <Text style={styles.actionSub}>Save a new Bank, UPI, Paytm, PayPal or USDT account</Text>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>

          {/* Action: Admin Center (if admin) */}
          {isAdmin && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminTab')}
              style={[styles.actionCard, styles.actionCardAdmin]}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: '#fef3c7' }]}>
                <ShieldAlert size={20} color="#b45309" />
              </View>
              <View style={styles.actionDetails}>
                <Text style={[styles.actionTitle, { color: '#92400e' }]}>Admin Control Center</Text>
                <Text style={styles.actionSub}>System analytics, user registry & payments audit</Text>
              </View>
              <ChevronRight size={18} color="#b45309" />
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogoutConfirm}
            style={styles.logoutBtn}
          >
            <LogOut size={16} color={colors.danger} />
            <Text style={styles.logoutBtnText}>Sign Out of PayVault</Text>
          </TouchableOpacity>
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
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderCard,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.float,
  },
  avatarText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extraBold,
    color: '#ffffff',
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  userEmail: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.success,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  adminText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#b45309',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderCard,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  actionCardAdmin: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  actionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionDetails: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  actionSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingVertical: 12,
    marginTop: spacing.md,
  },
  logoutBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.danger,
  },
});

export default DashboardScreen;
