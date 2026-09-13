import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -30,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({ message, type });

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    },
    [opacity, translateY, hideToast]
  );

  const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
  const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
  const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: colors.successLight,
          border: colors.successBorder,
          text: '#065f46',
          icon: <CheckCircle2 size={20} color={colors.success} />,
        };
      case 'error':
        return {
          bg: colors.dangerLight,
          border: colors.dangerBorder,
          text: colors.dangerDark,
          icon: <AlertCircle size={20} color={colors.danger} />,
        };
      default:
        return {
          bg: colors.primaryLight,
          border: colors.primaryBorder,
          text: colors.primaryDark,
          icon: <Info size={20} color={colors.primary} />,
        };
    }
  };

  const currentStyle = toast ? getToastStyle(toast.type) : null;

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, hideToast }}>
      {children}
      {toast && (
        <SafeAreaView pointerEvents="box-none" style={styles.toastContainer}>
          <Animated.View
            style={[
              styles.toastBox,
              {
                backgroundColor: currentStyle.bg,
                borderColor: currentStyle.border,
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.iconContainer}>{currentStyle.icon}</View>
            <Text style={[styles.toastText, { color: currentStyle.text }]}>
              {toast.message}
            </Text>
            <TouchableOpacity
              onPress={hideToast}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Dismiss notification"
            >
              <X size={16} color={currentStyle.text} />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 10 : 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    width: '100%',
    maxWidth: 500,
    ...shadows.card,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  toastText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});
