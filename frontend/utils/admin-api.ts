import axios from "axios";

const API_BASE_URL = "/api/admin";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
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
    return axios.patch(
      `${API_BASE_URL}/users/${id}`,
      userData,
      getAuthHeaders(),
    );
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

  // Team Management
  getTeams: async () => {
    return axios.get(`${API_BASE_URL}/teams`, getAuthHeaders());
  },

  getTeamById: async (id: string) => {
    return axios.get(`${API_BASE_URL}/teams/${id}`, getAuthHeaders());
  },

  deleteTeam: async (id: string) => {
    return axios.delete(`${API_BASE_URL}/teams/${id}`, getAuthHeaders());
  },
};

// Export individual functions for direct use
export const getUsers = async () => {
  const response = await adminApi.getUsers();
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await adminApi.getUserById(id);
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await adminApi.createUser(userData);
  return response.data;
};

export const updateUser = async (id: string, userData: any) => {
  const response = await adminApi.updateUser(id, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  await adminApi.deleteUser(id);
};

export const getAgents = async () => {
  const response = await adminApi.getAgents();
  return response.data;
};

export const getInvoices = async () => {
  const response = await adminApi.getInvoices();
  return response.data;
};

export const getTeams = async () => {
  const response = await adminApi.getTeams();
  return response.data;
};

export const getTeamById = async (id: string) => {
  const response = await adminApi.getTeamById(id);
  return response.data;
};

export const deleteTeam = async (id: string) => {
  await adminApi.deleteTeam(id);
};

export const getUserTeams = async (userId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/users/${userId}/teams`,
    getAuthHeaders(),
  );
  return response.data;
};
