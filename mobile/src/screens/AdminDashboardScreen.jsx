import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Users,
  CreditCard,
  Landmark,
  Smartphone,
  AtSign,
  Send,
  Coins,
  ArrowRight,
} from 'lucide-react-native';
import { fetchAdminStats, fetchAllUsers } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import Header from '../components/Header';
import { useToast } from '../context/ToastContext';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const AdminDashboardScreen = ({ navigation }) => {
  const { error } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetchAdminStats(),
        fetchAllUsers(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load admin analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <Header />

      {loading ? (
        <LoadingSpinner text="Loading administrator analytics..." />
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
          {/* Header Block */}
          <View style={styles.topBar}>
            <View style={styles.topBarText}>
              <View style={styles.titleRow}>
                <Text style={styles.pageTitle}>Admin Control Center</Text>
                <View style={styles.adminTag}>
                  <Text style={styles.adminTagText}>System Admin</Text>
                </View>
              </View>
              <Text style={styles.pageSub}>
                System metrics, registered users, and payment records overview.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('AdminPayments')}
              style={styles.allPaymentsBtn}
            >
              <CreditCard size={15} color="#ffffff" />
              <Text style={styles.allPaymentsBtnText}>All Records</Text>
            </TouchableOpacity>
          </View>

          {/* Top 2 Metric Cards */}
          <View style={styles.statsRow}>
            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Users size={18} color={colors.primary} />
                <Text style={styles.metricLabel}>Registered Users</Text>
              </View>
              <Text style={styles.metricVal}>{stats?.totalUsers || 0}</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <CreditCard size={18} color={colors.success} />
                <Text style={styles.metricLabel}>Total Payments</Text>
              </View>
              <Text style={[styles.metricVal, { color: colors.success }]}>
                {stats?.totalPayments || 0}
              </Text>
            </View>
          </View>

          {/* Payment Types Distribution */}
          <Text style={styles.sectionHeader}>Payment Channel Distribution</Text>
          <View style={styles.channelGrid}>
            <View style={[styles.channelBox, { backgroundColor: colors.channels.Bank.bg, borderColor: colors.channels.Bank.border }]}>
              <Landmark size={18} color={colors.channels.Bank.color} />
              <Text style={[styles.channelVal, { color: colors.channels.Bank.color }]}>
                {stats?.breakdown?.Bank || 0}
              </Text>
              <Text style={styles.channelLabel}>Bank Accounts</Text>
            </View>

            <View style={[styles.channelBox, { backgroundColor: colors.channels.UPI.bg, borderColor: colors.channels.UPI.border }]}>
              <AtSign size={18} color={colors.channels.UPI.color} />
              <Text style={[styles.channelVal, { color: colors.channels.UPI.color }]}>
                {stats?.breakdown?.UPI || 0}
              </Text>
              <Text style={styles.channelLabel}>UPI VPAs</Text>
            </View>

            <View style={[styles.channelBox, { backgroundColor: colors.channels.Paytm.bg, borderColor: colors.channels.Paytm.border }]}>
              <Smartphone size={18} color={colors.channels.Paytm.color} />
              <Text style={[styles.channelVal, { color: colors.channels.Paytm.color }]}>
                {stats?.breakdown?.Paytm || 0}
              </Text>
              <Text style={styles.channelLabel}>Paytm Wallets</Text>
            </View>

            <View style={[styles.channelBox, { backgroundColor: colors.channels.PayPal.bg, borderColor: colors.channels.PayPal.border }]}>
              <Send size={18} color={colors.channels.PayPal.color} />
              <Text style={[styles.channelVal, { color: colors.channels.PayPal.color }]}>
                {stats?.breakdown?.PayPal || 0}
              </Text>
              <Text style={styles.channelLabel}>PayPal Emails</Text>
            </View>

            <View style={[styles.channelBox, { backgroundColor: colors.channels.USDT.bg, borderColor: colors.channels.USDT.border }]}>
              <Coins size={18} color={colors.channels.USDT.color} />
              <Text style={[styles.channelVal, { color: colors.channels.USDT.color }]}>
                {stats?.breakdown?.USDT || 0}
              </Text>
              <Text style={styles.channelLabel}>USDT Wallets</Text>
            </View>
          </View>

          {/* Registered Users Directory */}
          <View style={styles.usersHeaderRow}>
            <Text style={styles.sectionHeader}>Users Directory ({users.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminPayments')}>
              <Text style={styles.inspectAllLink}>
                Search All Payments <ArrowRight size={12} color={colors.primary} />
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.usersCard}>
            {users.map((u, index) => (
              <View
                key={u._id}
                style={[
                  styles.userRow,
                  index < users.length - 1 && styles.userRowBorder,
                ]}
              >
                <View style={styles.userAvatarMini}>
                  <Text style={styles.userAvatarText}>
                    {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>

                <View style={styles.userDetails}>
                  <View style={styles.userNameRoleRow}>
                    <Text style={styles.userNameText}>{u.username}</Text>
                    {u.role === 'admin' ? (
                      <View style={styles.adminRoleTag}>
                        <Text style={styles.adminRoleTagText}>Admin</Text>
                      </View>
                    ) : (
                      <View style={styles.userRoleTag}>
                        <Text style={styles.userRoleTagText}>User</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userEmailText}>{u.email}</Text>
                </View>

                <View style={styles.userCountBadge}>
                  <Text style={styles.userCountNumber}>{u.totalPayments}</Text>
                  <Text style={styles.userCountLabel}>Methods</Text>
                </View>
              </View>
            ))}
          </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  topBarText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  adminTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  adminTagText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: '#b45309',
  },
  pageSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  allPaymentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  allPaymentsBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.sm,
  },
  metricIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
  },
  metricVal: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  sectionHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  channelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  channelBox: {
    width: '31%',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  channelVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    marginTop: 4,
  },
  channelLabel: {
    fontSize: 9,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  usersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  inspectAllLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  usersCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.card,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  userRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  userAvatarMini: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userAvatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  userNameRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  adminRoleTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  adminRoleTagText: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: '#b45309',
  },
  userRoleTag: {
    backgroundColor: colors.pillBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  userRoleTagText: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  userEmailText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  userCountBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  userCountNumber: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  userCountLabel: {
    fontSize: 8,
    color: colors.primary,
  },
});

export default AdminDashboardScreen;
