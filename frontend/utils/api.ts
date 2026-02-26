import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export const api = {
  // Email templates
  getEmailTemplates: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/email/templates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Webhooks
  getWebhooks: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/webhooks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Email campaigns
  getEmailCampaigns: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/email/campaigns`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Custom agents
  getCustomAgents: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/custom-agents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
