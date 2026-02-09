"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  TestTube,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

interface Webhook {
  _id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  failureCount: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  createdAt: string;
}

interface User {
  _id: string;
  email: string;
  plan: string;
  agentLimit: number;
  domains: string[];
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  // Fetch user profile
  const { data: user } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const response = await axios.get("http://localhost:5000/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (user?.plan === "agency") {
      fetchWebhooks();
    }
  }, [user]);

  const fetchWebhooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/webhooks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWebhooks(response.data);
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    }
  };

  const handleCreateWebhook = async (data: {
    url: string;
    events: string[];
    secret?: string;
  }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/webhooks",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 201 || response.status === 200) {
        setIsCreateModalOpen(false);
        fetchWebhooks();
      }
    } catch (error) {
      console.error("Failed to create webhook:", error);
    }
  };

  const handleUpdateWebhook = async (id: string, data: Partial<Webhook>) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/webhooks/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setSelectedWebhook(null);
        fetchWebhooks();
      }
    } catch (error) {
      console.error("Failed to update webhook:", error);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `http://localhost:5000/api/webhooks/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.status === 200) {
          fetchWebhooks();
        }
      } catch (error) {
        console.error("Failed to delete webhook:", error);
      }
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/webhooks/${id}/test`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Webhook test triggered successfully");
      }
    } catch (error: any) {
      console.error("Failed to test webhook:", error);
      toast.error(
        "Failed to test webhook: " +
          (error.response?.data?.message || error.message || "Unknown error"),
      );
    }
  };

  const toggleWebhookActive = async (id: string, active: boolean) => {
    try {
      await handleUpdateWebhook(id, { active });
    } catch (error) {
      console.error("Failed to toggle webhook status:", error);
    }
  };

  if (user?.plan !== "agency") {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TestTube className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Webhook Feature Not Available
          </h3>
          <p className="text-gray-600 mb-6">
            The webhook feature is only available to Agency plan users. Please
            upgrade your plan to access this feature.
          </p>
          <Button onClick={() => (window.location.href = "/dashboard/billing")}>
            View Plans & Upgrade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600 mt-1">
            Manage your webhooks to receive real-time updates for chat events
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webhooks.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Webhooks Created
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first webhook to start receiving real-time event
                notifications
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </div>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div
              key={webhook._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Webhook URL */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Webhook URL
                  </h3>
                  <a
                    href={webhook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium break-all"
                  >
                    {webhook.url}
                  </a>
                </div>

                {/* Events */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Events
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Status
                  </h3>
                  <button
                    onClick={() =>
                      toggleWebhookActive(webhook._id, !webhook.active)
                    }
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      webhook.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {webhook.active ? (
                      <>
                        <ToggleRight className="w-4 h-4 mr-2" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 mr-2" />
                        Inactive
                      </>
                    )}
                  </button>
                </div>

                {/* Failure Count */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Failures
                  </h3>
                  <span
                    className={`text-sm font-medium ${
                      webhook.failureCount > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {webhook.failureCount}
                  </span>
                </div>

                {/* Last Success */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Last Success
                  </h3>
                  <span className="text-sm text-gray-500">
                    {webhook.lastSuccessAt
                      ? new Date(webhook.lastSuccessAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook._id)}
                    className="flex-1"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedWebhook(webhook)}
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteWebhook(webhook._id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isCreateModalOpen && (
        <WebhookModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateWebhook}
        />
      )}

      {selectedWebhook && (
        <WebhookModal
          isOpen={!!selectedWebhook}
          onClose={() => setSelectedWebhook(null)}
          onSubmit={(data) => handleUpdateWebhook(selectedWebhook._id, data)}
          initialData={selectedWebhook}
          isEdit={true}
        />
      )}
    </div>
  );
}

function WebhookModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Webhook;
  isEdit?: boolean;
}) {
  const [formData, setFormData] = useState({
    url: initialData?.url || "",
    events: initialData?.events || [],
    secret: initialData?.secret || "",
  });

  const availableEvents = [
    "chat_started",
    "message_sent",
    "message_received",
    "lead_captured",
    "chat_ended",
    "agent_created",
    "agent_updated",
    "agent_deleted",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleEventChange = (event: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      events: checked
        ? [...prev.events, event]
        : prev.events.filter((e) => e !== event),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Webhook" : "Create Webhook"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Events <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <label
                  key={event}
                  className="flex items-center p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={(e) => handleEventChange(event, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {event.replace("_", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret (optional)
            </label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, secret: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter secret key for verification"
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, this secret will be used to sign webhook requests for
              verification.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Webhook" : "Create Webhook"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
