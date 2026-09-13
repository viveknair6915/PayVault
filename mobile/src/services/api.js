import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default host: Cloud Production on Render (Runs 100% independently without laptop)
export const DEFAULT_BASE_URL = 'https://payvault-kudl.onrender.com/api';

let customBaseUrl = null;

// Initialize custom URL from persistent storage if previously set
AsyncStorage.getItem('@payvault_server_url')
  .then((saved) => {
    if (saved && !saved.includes('10.0.2.2')) {
      customBaseUrl = saved;
      API.defaults.baseURL = saved;
    } else {
      customBaseUrl = DEFAULT_BASE_URL;
      API.defaults.baseURL = DEFAULT_BASE_URL;
    }
  })
  .catch(() => {});

export const setCustomBaseUrl = async (url) => {
  customBaseUrl = url;
  if (url) {
    API.defaults.baseURL = url;
    try {
      await AsyncStorage.setItem('@payvault_server_url', url);
    } catch (e) {
      console.warn('Failed to persist server url:', e);
    }
  }
};

export const getBaseUrl = () => customBaseUrl || DEFAULT_BASE_URL;

const API = axios.create({
  baseURL: DEFAULT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
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
