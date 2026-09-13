import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EditPaymentScreen from '../screens/EditPaymentScreen';
import AdminPaymentsScreen from '../screens/AdminPaymentsScreen';
import BottomTabNavigator from './BottomTabNavigator';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors } from '../styles/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Authenticating PayVault session..." size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen
            name="EditPayment"
            component={EditPaymentScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="AdminPayments"
            component={AdminPaymentsScreen}
            options={{ presentation: 'card' }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppNavigator;
