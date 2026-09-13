import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Landmark,
  Smartphone,
  AtSign,
  Send,
  Coins,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react-native';
import { useToast } from '../context/ToastContext';
import { maskString } from '../utils/formatters';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const PaymentCard = ({ payment, onDeleteClick }) => {
  const navigation = useNavigation();
  const { info } = useToast();
  const [isMasked, setIsMasked] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  const channelConfig = colors.channels[payment.paymentType] || colors.channels.Bank;

  const handleCopy = (text, label) => {
    if (!text) return;
    Clipboard.setString(text);
    setCopiedKey(label);
    info(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const renderChannelIcon = (type) => {
    switch (type) {
      case 'Bank':
        return <Landmark size={15} color={channelConfig.color} />;
      case 'Paytm':
        return <Smartphone size={15} color={channelConfig.color} />;
      case 'UPI':
        return <AtSign size={15} color={channelConfig.color} />;
      case 'PayPal':
        return <Send size={15} color={channelConfig.color} />;
      case 'USDT':
        return <Coins size={15} color={channelConfig.color} />;
      default:
        return <Landmark size={15} color={channelConfig.color} />;
    }
  };

  const renderDisclaimerText = (type) => {
    switch (type) {
      case 'Bank':
        return 'Ensure transfer details match the registered bank beneficiary.';
      case 'UPI':
        return 'Ensure you are sending to the correct verified UPI VPA.';
      case 'Paytm':
        return 'Only transfers to verified Paytm wallet numbers are processed.';
      case 'PayPal':
        return 'Transfers are delivered via PayPal invoice or direct credit.';
      case 'USDT':
        return 'Only send Tether USD (BEP20 / TRC20) assets. Other assets cannot be recovered.';
      default:
        return 'Please ensure account information is accurate.';
    }
  };

  const renderFieldRow = (label, value, copyLabel, isMono = false, isSensitive = false) => {
    const displayValue = isSensitive && isMasked ? maskString(value, 0, 4) : value;

    return (
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}:</Text>
        <View style={styles.fieldValueWrap}>
          <Text
            style={[
              styles.fieldValue,
              isMono && styles.fieldValueMono,
            ]}
            numberOfLines={2}
          >
            {displayValue || '—'}
          </Text>
          {value ? (
            <TouchableOpacity
              onPress={() => handleCopy(value, copyLabel)}
              style={styles.copyBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={`Copy ${copyLabel}`}
            >
              {copiedKey === copyLabel ? (
                <Check size={14} color={colors.success} />
              ) : (
                <Copy size={14} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.channelBadge, { backgroundColor: channelConfig.bg, borderColor: channelConfig.border }]}>
            {renderChannelIcon(payment.paymentType)}
            <Text style={[styles.channelBadgeText, { color: channelConfig.color }]}>
              {payment.paymentType}
            </Text>
          </View>
          <Text style={styles.mainTitle} numberOfLines={1}>
            {payment.paymentType === 'Bank'
              ? payment.bankName
              : payment.paymentType === 'USDT'
              ? 'USDT Wallet'
              : `${payment.paymentType} Transfer`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsMasked(!isMasked)}
          style={styles.maskToggleBtn}
          accessibilityLabel={isMasked ? 'Reveal details' : 'Mask details'}
        >
          {isMasked ? (
            <Eye size={14} color={colors.textMuted} />
          ) : (
            <EyeOff size={14} color={colors.primary} />
          )}
          <Text style={[styles.maskToggleText, !isMasked && { color: colors.primary }]}>
            {isMasked ? 'Reveal' : 'Mask'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>Account Information</Text>

        {payment.paymentType === 'Bank' && (
          <>
            {renderFieldRow('Account Name', payment.accountHolderName, 'Account Name')}
            {renderFieldRow('Account Number', payment.accountNumber, 'Account Number', true, true)}
            {renderFieldRow('IFSC Code', payment.ifscCode, 'IFSC Code', true)}
            {renderFieldRow('Bank Name', payment.bankName, 'Bank Name')}
            {renderFieldRow('Branch', payment.branchName, 'Branch Name')}
          </>
        )}

        {payment.paymentType === 'Paytm' && (
          <>
            {renderFieldRow('Paytm Mobile', payment.paytmNumber, 'Paytm Mobile', true, true)}
          </>
        )}

        {payment.paymentType === 'UPI' && (
          <>
            {renderFieldRow('UPI ID', payment.upiId, 'UPI ID', true)}
          </>
        )}

        {payment.paymentType === 'PayPal' && (
          <>
            {renderFieldRow('PayPal Email', payment.paypalEmail, 'PayPal Email', true)}
          </>
        )}

        {payment.paymentType === 'USDT' && (
          <>
            {renderFieldRow('USDT Wallet', payment.usdtAddress, 'USDT Wallet Address', true, true)}
          </>
        )}
      </View>

      <View style={styles.disclaimerCard}>
        <View style={styles.disclaimerHeader}>
          <AlertTriangle size={14} color={colors.warning} />
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
        </View>
        <View style={styles.disclaimerBody}>
          <ShieldCheck size={14} color={colors.primary} style={styles.disclaimerShield} />
          <Text style={styles.disclaimerText}>
            {renderDisclaimerText(payment.paymentType)}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditPayment', { id: payment._id })}
          style={styles.editBtn}
        >
          <Edit2 size={14} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDeleteClick(payment)}
          style={styles.delBtn}
        >
          <Trash2 size={14} color={colors.danger} />
          <Text style={styles.delBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  channelBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  mainTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    flex: 1,
  },
  maskToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.pillBg,
  },
  maskToggleText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: typography.weights.semibold,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  infoBoxTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fieldLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
    width: '32%',
  },
  fieldValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flex: 1,
  },
  fieldValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textMain,
    textAlign: 'right',
  },
  fieldValueMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: typography.weights.bold,
  },
  copyBtn: {
    padding: 4,
  },
  disclaimerCard: {
    backgroundColor: '#fffbeb',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fef3c7',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  disclaimerTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#b45309',
  },
  disclaimerBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  disclaimerShield: {
    marginTop: 2,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#92400e',
    flex: 1,
    lineHeight: 15,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryLight,
  },
  editBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  delBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerLight,
  },
  delBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.danger,
  },
});

export default PaymentCard;
