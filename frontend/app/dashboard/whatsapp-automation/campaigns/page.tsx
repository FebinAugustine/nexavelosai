"use client";

import { useState, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function WhatsAppCampaignsContent() {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    templateId: "",
    scheduledAt: "",
    contactListId: "",
    variables: {},
  });

  const queryClient = useQueryClient();

  const { data: campaigns } = useQuery({
    queryKey: ["whatsappCampaigns"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/whatsapp/campaigns",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["whatsappTemplates"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/whatsapp/templates",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  const { data: contactLists = [] } = useQuery({
    queryKey: ["whatsappContactLists"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/whatsapp/contacts/lists",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/whatsapp/campaigns",
        campaignData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappCampaigns"] });
      setShowCreateForm(false);
      setIsCreating(false);
      setCreateFormData({
        name: "",
        description: "",
        templateId: "",
        scheduledAt: "",
        contactListId: "",
        variables: {},
      });
    },
    onError: (error: any) => {
      console.error("Error creating campaign:", error);
      setIsCreating(false);
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/whatsapp/campaigns/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappCampaigns"] });
    },
    onError: (error: any) => {
      console.error("Error deleting campaign:", error);
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/whatsapp/campaigns/${campaignId}/send`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappCampaigns"] });
    },
    onError: (error: any) => {
      console.error("Error sending campaign:", error);
    },
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/whatsapp/campaigns/${campaignId}/pause`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappCampaigns"] });
    },
    onError: (error: any) => {
      console.error("Error pausing campaign:", error);
    },
  });

  const resumeCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/whatsapp/campaigns/${campaignId}/resume`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappCampaigns"] });
    },
    onError: (error: any) => {
      console.error("Error resuming campaign:", error);
    },
  });

  const handleCreateCampaign = async () => {
    setIsCreating(true);
    try {
      await createCampaignMutation.mutateAsync(createFormData);
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaignMutation.mutateAsync(campaignId);
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (confirm("Are you sure you want to send this campaign now?")) {
      try {
        await sendCampaignMutation.mutateAsync(campaignId);
      } catch (error) {
        console.error("Error sending campaign:", error);
      }
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    if (confirm("Are you sure you want to pause this campaign?")) {
      try {
        await pauseCampaignMutation.mutateAsync(campaignId);
      } catch (error) {
        console.error("Error pausing campaign:", error);
      }
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    if (confirm("Are you sure you want to resume this campaign?")) {
      try {
        await resumeCampaignMutation.mutateAsync(campaignId);
      } catch (error) {
        console.error("Error resuming campaign:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            Draft
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
            Scheduled
          </span>
        );
      case "SENDING":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
            Sending
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case "PAUSED":
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
            Paused
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Campaigns</h1>
          <p className="text-black">
            Create and manage your WhatsApp campaigns
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          + Create Campaign
        </button>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-black">
            Create New Campaign
          </h3>
          <p className="text-black mb-6">
            Create a new WhatsApp campaign to send messages to your contacts
            using pre-approved templates.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                placeholder="Welcome Campaign"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Description
              </label>
              <textarea
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    description: e.target.value,
                  })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                placeholder="Welcome message for new subscribers"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Message Template
              </label>
              <select
                value={createFormData.templateId}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    templateId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="">Select a template...</option>
                {templates &&
                  templates.map((template: any) => (
                    <option key={template._id} value={template._id}>
                      {template.name} ({template.languageCode})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Scheduled Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={createFormData.scheduledAt}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    scheduledAt: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Contact List
              </label>
              <select
                value={createFormData.contactListId}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    contactListId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="">Select a contact list...</option>
                {contactLists &&
                  contactLists.map((list: any) => (
                    <option key={list._id} value={list._id}>
                      {list.fileName} ({list.contactCount} contacts)
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a contact list to send messages to
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleCreateCampaign}
                disabled={
                  isCreating ||
                  !createFormData.name ||
                  !createFormData.templateId ||
                  !createFormData.contactListId
                }
                className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Campaign"}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setIsCreating(false);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign: any) => (
            <div
              key={campaign._id}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    {campaign.name}
                  </h3>
                  {campaign.description && (
                    <p className="text-sm text-gray-600">
                      {campaign.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(campaign.status)}
                  {campaign.scheduledAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {campaign.status === "SCHEDULED" ? "Scheduled " : "Sent "}
                      {formatDate(campaign.scheduledAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Campaign Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Recipients:</span>
                  <span className="text-sm font-medium text-black">
                    {campaign.contacts ? campaign.contacts.length : "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Template:</span>
                  <span className="text-sm font-medium text-black">
                    {campaign.templateId || "N/A"}
                  </span>
                </div>
                {campaign.sentCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sent:</span>
                    <span className="text-sm font-medium text-black">
                      {campaign.sentCount}
                    </span>
                  </div>
                )}
                {campaign.deliveredCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delivered:</span>
                    <span className="text-sm font-medium text-black">
                      {campaign.deliveredCount}
                    </span>
                  </div>
                )}
                {campaign.readCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Read:</span>
                    <span className="text-sm font-medium text-black">
                      {campaign.readCount}
                    </span>
                  </div>
                )}
                {campaign.failedCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Failed:</span>
                    <span className="text-sm font-medium text-black">
                      {campaign.failedCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {campaign.status === "DRAFT" && (
                  <button
                    onClick={() => handleSendCampaign(campaign._id)}
                    className="flex-1 p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Send
                  </button>
                )}

                {campaign.status === "SCHEDULED" && (
                  <button
                    onClick={() => handlePauseCampaign(campaign._id)}
                    className="flex-1 p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    Pause
                  </button>
                )}

                {campaign.status === "PAUSED" && (
                  <button
                    onClick={() => handleResumeCampaign(campaign._id)}
                    className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Resume
                  </button>
                )}

                {campaign.status === "SENDING" && (
                  <button
                    onClick={() => handlePauseCampaign(campaign._id)}
                    className="flex-1 p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    Pause
                  </button>
                )}

                <button
                  onClick={() => handleDeleteCampaign(campaign._id)}
                  className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📱</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">
            No campaigns created
          </h3>
          <p className="text-black mb-8">
            Create your first WhatsApp campaign to start sending messages to
            your contacts
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            + Create Campaign
          </button>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-black">
              About WhatsApp Campaigns
            </h3>
            <p className="text-black mb-2">
              • Campaigns use pre-approved WhatsApp Business templates
            </p>
            <p className="text-black mb-2">
              • Each campaign sends messages to multiple contacts
            </p>
            <p className="text-black mb-2">
              • You can schedule campaigns for later or send them immediately
            </p>
            <p className="text-black mb-2">
              • Monitor delivery and read statuses in real-time
            </p>
            <p className="text-black">
              • Maintain a quality rating above green to keep sending privileges
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppCampaignsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Campaigns</h1>
              <p className="text-black">
                Create and manage your WhatsApp campaigns
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      }
    >
      <WhatsAppCampaignsContent />
    </Suspense>
  );
}
