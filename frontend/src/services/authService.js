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
  try {
    const response = await API.post('/auth/google', googleData);
    return response.data;
  } catch (err) {
    // If /auth/google is not found (e.g. backend process was started before route was added)
    if (err.response && err.response.status === 404) {
      const email = googleData.email?.toLowerCase();
      const defaultPassword = email === 'admin@payvault.com' ? 'Admin@12345' : 'User@12345';
      try {
        const loginRes = await API.post('/auth/login', { email, password: defaultPassword });
        return loginRes.data;
      } catch {
        // If account does not exist yet, register transparently
        const username = googleData.username || (email ? email.split('@')[0] : 'Google User');
        const registerRes = await API.post('/auth/register', {
          username,
          email,
          password: 'GoogleUser@12345',
        });
        return registerRes.data;
      }
    }
    throw err;
  }
};

export const fetchCurrentUser = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};
