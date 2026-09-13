import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShieldCheck, ArrowLeft, SunMedium } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const Header = ({ showBack = false, title = null }) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();

  const handleAvatarPress = () => {
    navigation.navigate('MainTabs', { screen: 'DashboardTab' });
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textMain} />
          </TouchableOpacity>
        )}

        <View style={styles.brandGroup}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>{title || 'PayVault'}</Text>
            <Text style={styles.brandSub}>MULTI-PAYMENT SYSTEM</Text>
          </View>
        </View>
      </View>

      {isAuthenticated && user && (
        <View style={styles.headerRight}>
          <View style={[styles.refBadge, styles.badgePoints]}>
            <Text style={styles.badgeText}>50</Text>
            <Text style={styles.starText}>★</Text>
          </View>

          <View style={[styles.refBadge, styles.badgeCash]}>
            <Text style={styles.badgeText}>₹0.00</Text>
            <SunMedium size={12} color={colors.warning} />
          </View>

          <TouchableOpacity
            onPress={handleAvatarPress}
            style={styles.avatarRing}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go to profile"
          >
            <Text style={styles.avatarLetter}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    ...shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  brandTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    color: colors.textMain,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  refBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  badgePoints: {
    backgroundColor: colors.primaryLight,
  },
  badgeCash: {
    backgroundColor: colors.warningLight,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
  },
  starText: {
    fontSize: 12,
    color: colors.primary,
  },
  avatarRing: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  avatarLetter: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
});

export default Header;
