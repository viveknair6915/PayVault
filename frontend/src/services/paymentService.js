import API from './api';

export const fetchPayments = async (paymentType) => {
  const url = paymentType && paymentType !== 'All' 
    ? `/payments?paymentType=${encodeURIComponent(paymentType)}` 
    : '/payments';
  const response = await API.get(url);
  return response.data;
};

export const fetchPaymentById = async (id) => {
  const response = await API.get(`/payments/${id}`);
  return response.data;
};

export const createPayment = async (paymentData) => {
  const response = await API.post('/payments', paymentData);
  return response.data;
};

export const updatePayment = async (id, paymentData) => {
  const response = await API.put(`/payments/${id}`, paymentData);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await API.delete(`/payments/${id}`);
  return response.data;
};
