import axios from 'axios';

const API_BASE_URL = '/api/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// User Management
export const adminApi = {
  getUsers: async () => {
    return axios.get(`${API_BASE_URL}/users`, getAuthHeaders());
  },

  getUserById: async (id: string) => {
    return axios.get(`${API_BASE_URL}/users/${id}`, getAuthHeaders());
  },

  createUser: async (userData: any) => {
    return axios.post(`${API_BASE_URL}/users`, userData, getAuthHeaders());
  },

  updateUser: async (id: string, userData: any) => {
    return axios.patch(`${API_BASE_URL}/users/${id}`, userData, getAuthHeaders());
  },

  deleteUser: async (id: string) => {
    return axios.delete(`${API_BASE_URL}/users/${id}`, getAuthHeaders());
  },

  // Agent Management
  getAgents: async () => {
    return axios.get(`${API_BASE_URL}/agents`, getAuthHeaders());
  },

  // Invoice Management
  getInvoices: async () => {
    return axios.get(`${API_BASE_URL}/invoices`, getAuthHeaders());
  },
};
