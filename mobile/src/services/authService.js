import API from './api';

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const googleLoginUser = async (googleData) => {
  const response = await API.post('/auth/google', googleData);
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};
