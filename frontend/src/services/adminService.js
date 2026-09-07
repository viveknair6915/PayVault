import API from './api';

export const fetchAllUsers = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

export const fetchAllPayments = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== '' && params[key] !== 'All') {
      query.append(key, params[key]);
    }
  });

  const queryString = query.toString();
  const url = queryString ? `/admin/payments?${queryString}` : '/admin/payments';
  const response = await API.get(url);
  return response.data;
};

export const fetchAdminStats = async () => {
  const response = await API.get('/admin/stats');
  return response.data;
};
