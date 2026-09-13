import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { loginUser, registerUser, googleLoginUser, fetchCurrentUser } from '../services/authService';

export const GOOGLE_WEB_CLIENT_ID = '422689466326-kd85r2c87rcrvod1nit5as08ahbj2vq7.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID = '422689466326-kri12n241kfti33gjlpivoff4vds5hu7.apps.googleusercontent.com';

try {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
    scopes: ['profile', 'email'],
  });
} catch (e) {
  console.warn('GoogleSignin.configure warning:', e);
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['payvault_token', 'payvault_user']);
    } catch (err) {
      console.warn('Error clearing local storage on logout:', err);
    }
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
        await AsyncStorage.setItem('payvault_user', JSON.stringify(res.user));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('payvault_token');
        const savedUser = await AsyncStorage.getItem('payvault_user');

        if (savedToken) {
          setToken(savedToken);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }

          try {
            const res = await fetchCurrentUser();
            if (res.success && res.user) {
              setUser(res.user);
              await AsyncStorage.setItem('payvault_user', JSON.stringify(res.user));
            } else {
              await logout();
            }
          } catch (err) {
            console.warn('Backend session verification failed:', err.message);
            if (err.response?.status === 401) {
              await logout();
            }
          }
        }
      } catch (err) {
        console.warn('Failed initializing auth from storage:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.success && res.token) {
      await AsyncStorage.setItem('payvault_token', res.token);
      await AsyncStorage.setItem('payvault_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (username, email, password) => {
    const res = await registerUser({ username, email, password });
    if (res.success && res.token) {
      await AsyncStorage.setItem('payvault_token', res.token);
      await AsyncStorage.setItem('payvault_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const loginWithGoogle = async (googleData) => {
    const res = await googleLoginUser(googleData);
    if (res.success && res.token) {
      await AsyncStorage.setItem('payvault_token', res.token);
      await AsyncStorage.setItem('payvault_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Google login failed');
  };

  const signInWithGoogleNative = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        if (tokens?.idToken) {
          return await loginWithGoogle({ credential: tokens.idToken });
        }
        throw new Error('Google Sign-In completed but no ID token was provided.');
      }
      return await loginWithGoogle({ credential: idToken });
    } catch (err) {
      if (err.code === statusCodes?.SIGN_IN_CANCELLED) {
        throw new Error('Google sign-in was cancelled.');
      } else if (err.code === statusCodes?.IN_PROGRESS) {
        throw new Error('Google sign-in is already in progress.');
      } else if (err.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services is not available or outdated.');
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        loginWithGoogle,
        signInWithGoogleNative,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
