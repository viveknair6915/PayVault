import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { User, CreditCard, PlusCircle, ShieldAlert } from 'lucide-react-native';
import DashboardScreen from '../screens/DashboardScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../styles/theme';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: spacing.xs,
          paddingTop: spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: typography.weights.semibold,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 20} color={color} />,
        }}
      />

      <Tab.Screen
        name="PaymentsTab"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ color, size }) => <CreditCard size={size || 20} color={color} />,
        }}
      />

      <Tab.Screen
        name="AddPaymentTab"
        component={AddPaymentScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size || 20} color={color} />,
        }}
      />

      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminDashboardScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color, size }) => <ShieldAlert size={size || 20} color={color} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
