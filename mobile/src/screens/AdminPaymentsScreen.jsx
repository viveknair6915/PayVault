import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  CreditCard,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { fetchAllPayments } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import Header from '../components/Header';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const TYPE_OPTIONS = ['All', 'Bank', 'Paytm', 'UPI', 'PayPal', 'USDT'];

const AdminPaymentsScreen = () => {
  const { error, info } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  const [inspectPayment, setInspectPayment] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllPayments({
        page,
        limit: 10,
        search: searchTerm,
        paymentType: selectedType,
      });

      if (res.success) {
        setPayments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to query payment records.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedType, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = () => {
    setPage(1);
    loadData();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setPage(1);
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    Clipboard.setString(text);
    setCopiedKey(key);
    info(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderPaymentSummary = (p) => {
    switch (p.paymentType) {
      case 'Bank':
        return `${p.bankName || 'Bank'} • A/C: ${p.accountNumber || '—'} (IFSC: ${p.ifscCode || '—'})`;
      case 'Paytm':
        return `Phone: ${p.paytmNumber || '—'}`;
      case 'UPI':
        return `UPI: ${p.upiId || '—'}`;
      case 'PayPal':
        return `Email: ${p.paypalEmail || '—'}`;
      case 'USDT':
        return `Wallet: ${p.usdtAddress ? `${p.usdtAddress.slice(0, 10)}...${p.usdtAddress.slice(-6)}` : '—'}`;
      default:
        return '—';
    }
  };

  return (
    <View style={styles.container}>
      <Header showBack={true} title="Payment Records" />

      <View style={styles.searchSection}>
        <View style={styles.searchInputWrap}>
          <Search size={16} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearchSubmit}
            placeholder="Search user, bank, IFSC, UPI, wallet..."
            placeholderTextColor={colors.textLight}
            returnKeyType="search"
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <X size={16} color={colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typePillsScroll}
        >
          {TYPE_OPTIONS.map((type) => {
            const isActive = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setSelectedType(type);
                  setPage(1);
                }}
                style={[styles.typePill, isActive && styles.typePillActive]}
              >
                <Text style={[styles.typePillText, isActive && styles.typePillTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingSpinner text="Querying payment database..." />
      ) : payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CreditCard size={40} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No payment records found</Text>
          <Text style={styles.emptyDesc}>
            No entries match your search query or channel filters.
          </Text>
          <TouchableOpacity onPress={handleResetFilters} style={styles.resetBtn}>
            <RotateCcw size={14} color={colors.primary} />
            <Text style={styles.resetBtnText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={payments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const channelConfig = colors.channels[item.paymentType] || colors.channels.Bank;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setInspectPayment(item)}
                  style={styles.recordCard}
                >
                  <View style={styles.recordTopRow}>
                    <View style={styles.userBadgeRow}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                          {item.user?.username ? item.user.username.charAt(0).toUpperCase() : 'U'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.userName}>{item.user?.username || 'Unknown'}</Text>
                        <Text style={styles.userEmail}>{item.user?.email || '—'}</Text>
                      </View>
                    </View>

                    <View style={[styles.channelTag, { backgroundColor: channelConfig.bg, borderColor: channelConfig.border }]}>
                      <Text style={[styles.channelTagText, { color: channelConfig.color }]}>
                        {item.paymentType}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.summaryText} numberOfLines={2}>
                    {renderPaymentSummary(item)}
                  </Text>

                  <View style={styles.recordFooter}>
                    <Text style={styles.dateText}>
                      Created {formatDate(item.createdAt)}
                    </Text>
                    <View style={styles.inspectBtn}>
                      <Eye size={13} color={colors.primary} />
                      <Text style={styles.inspectBtnText}>Inspect Details</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.paginationBar}>
            <Text style={styles.paginationInfo}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </Text>

            <View style={styles.paginationButtons}>
              <TouchableOpacity
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                disabled={page === 1}
              >
                <ChevronLeft size={16} color={page === 1 ? colors.textLight : colors.textMain} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                style={[styles.pageBtn, page >= pagination.pages && styles.pageBtnDisabled]}
                disabled={page >= pagination.pages}
              >
                <ChevronRight size={16} color={page >= pagination.pages ? colors.textLight : colors.textMain} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {inspectPayment && (
        <Modal
          transparent
          visible={!!inspectPayment}
          animationType="fade"
          onRequestClose={() => setInspectPayment(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalDialog}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Payment Record Inspection</Text>
                  <Text style={styles.modalSub}>
                    ID: {inspectPayment._id}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setInspectPayment(null)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Owner Information</Text>
                  <Text style={styles.modalFieldText}>Username: {inspectPayment.user?.username}</Text>
                  <Text style={styles.modalFieldText}>Email: {inspectPayment.user?.email}</Text>
                  <Text style={styles.modalFieldText}>Role: {inspectPayment.user?.role}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Financial Parameters</Text>
                  <Text style={styles.modalFieldText}>Type: {inspectPayment.paymentType}</Text>

                  {inspectPayment.paymentType === 'Bank' && (
                    <>
                      <View style={styles.copyRow}>
                        <Text style={styles.modalFieldText}>A/C Name: {inspectPayment.accountHolderName}</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(inspectPayment.accountHolderName, 'Name')}>
                          {copiedKey === 'Name' ? <Check size={13} color={colors.success} /> : <Copy size={13} color={colors.primary} />}
                        </TouchableOpacity>
                      </View>
                      <View style={styles.copyRow}>
                        <Text style={styles.modalFieldText}>A/C Number: {inspectPayment.accountNumber}</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(inspectPayment.accountNumber, 'Account Number')}>
                          {copiedKey === 'Account Number' ? <Check size={13} color={colors.success} /> : <Copy size={13} color={colors.primary} />}
                        </TouchableOpacity>
                      </View>
                      <View style={styles.copyRow}>
                        <Text style={styles.modalFieldText}>IFSC: {inspectPayment.ifscCode}</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(inspectPayment.ifscCode, 'IFSC')}>
                          {copiedKey === 'IFSC' ? <Check size={13} color={colors.success} /> : <Copy size={13} color={colors.primary} />}
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.modalFieldText}>Bank: {inspectPayment.bankName}</Text>
                      <Text style={styles.modalFieldText}>Branch: {inspectPayment.branchName}</Text>
                    </>
                  )}

                  {inspectPayment.paymentType === 'Paytm' && (
                    <View style={styles.copyRow}>
                      <Text style={styles.modalFieldText}>Phone: {inspectPayment.paytmNumber}</Text>
                      <TouchableOpacity onPress={() => copyToClipboard(inspectPayment.paytmNumber, 'Phone')}>
                        {copiedKey === 'Phone' ? <Check size={13} color={colors.success} /> : <Copy size={13} color={colors.primary} />}
                      </TouchableOpacity>
                    </View>
                  )}

                  {inspectPayment.paymentType === 'UPI' && (
                    <View style={styles.copyRow}>
                      <Text style={styles.modalFieldText}>UPI ID: {inspectPayment.upiId}</Text>
                      <TouchableOpacity onPress={() => copyToClipboard(inspectPayment.upiId, 'UPI ID')}>
                        {copiedKey === 'UPI ID' ? <Check size={13} color={colors.success} /> : <Copy size={13} color={colors.primary} />}
                      </TouchableOpacity>
                    </View>
                  )}

                  {inspectPayment.paymentType === 'PayPal' && (
                    <View style={styles.copyRow}>
                      <Text style={styles.modalFieldText}>PayPal Email: {inspectPayment.paypalEmail}</Text>
                      <TouchableOpacity onPress={() => copyToClipboard(inspectPayment.paypalEmail, 'Email')}>
                        {copiedKey === 'Email' ? <Check size={13} color={colors.success} /> : <Copy size={13} color={colors.primary} />}
                      </TouchableOpacity>
                    </View>
                  )}

                  {inspectPayment.paymentType === 'USDT' && (
                    <View style={styles.copyRow}>
                      <Text style={[styles.modalFieldText, { flex: 1 }]}>Wallet: {inspectPayment.usdtAddress}</Text>
                      <TouchableOpacity onPress={() => copyToClipboard(inspectPayment.usdtAddress, 'Address')}>
                        {copiedKey === 'Address' ? <Check size={13} color={colors.success} /> : <Copy size={13} color={colors.primary} />}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setInspectPayment(null)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseBtnText}>Close Inspection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    ...shadows.sm,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.textMain,
    padding: 0,
  },
  typePillsScroll: {
    gap: spacing.xs,
  },
  typePill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.pillBg,
    marginRight: spacing.xs,
  },
  typePillActive: {
    backgroundColor: colors.primary,
  },
  typePillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
  },
  typePillTextActive: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  recordCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  userName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  userEmail: {
    fontSize: 10,
    color: colors.textMuted,
  },
  channelTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  channelTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  summaryText: {
    fontSize: typography.sizes.xs,
    color: colors.textMain,
    marginVertical: spacing.xs,
    lineHeight: 16,
  },
  recordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  dateText: {
    fontSize: 10,
    color: colors.textLight,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
  },
  inspectBtnText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  paginationInfo: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    flex: 1,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: spacing.sm,
  },
  emptyDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  resetBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  inspectBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
    ...shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  modalSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalScroll: {
    marginBottom: spacing.md,
  },
  modalSection: {
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalFieldText: {
    fontSize: typography.sizes.xs,
    color: colors.textMain,
    marginVertical: 2,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
});

export default AdminPaymentsScreen;
