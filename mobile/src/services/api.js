import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default host: 10.0.2.2 for Android Emulator, localhost for iOS simulator
export const DEFAULT_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://10.0.2.2:5000/api',
});

let customBaseUrl = null;

export const setCustomBaseUrl = (url) => {
  customBaseUrl = url;
  if (url) {
    API.defaults.baseURL = url;
  }
};

export const getBaseUrl = () => customBaseUrl || DEFAULT_BASE_URL;

const API = axios.create({
  baseURL: DEFAULT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token from AsyncStorage
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('payvault_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error retrieving token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle session expiration or 401s
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.multiRemove(['payvault_token', 'payvault_user']);
      } catch (e) {
        console.warn('Error clearing expired credentials:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
