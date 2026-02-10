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
  domain?: string;
  agentId?: string;
}

interface User {
  _id: string;
  email: string;
  plan: string;
  agentLimit: number;
  domains: string[];
}

interface WebhookEvent {
  _id: string;
  webhookId: string;
  eventType: string;
  payload: any;
  status: "success" | "failure" | "pending";
  responseStatus?: number;
  responseBody?: any;
  errorMessage?: string;
  retryCount: number;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [selectedWebhookEvents, setSelectedWebhookEvents] = useState<
    WebhookEvent[]
  >([]);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);

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

  const fetchWebhookEvents = async (webhookId: string, page: number = 1) => {
    setEventsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/webhooks/${webhookId}/events`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit: 50 },
        },
      );

      setSelectedWebhookEvents(response.data.items);
      setEventsTotalPages(response.data.totalPages);
      setEventsPage(page);
    } catch (error) {
      console.error("Failed to fetch webhook events:", error);
      toast.error("Failed to fetch webhook events");
    } finally {
      setEventsLoading(false);
    }
  };

  const handleViewEvents = async (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    await fetchWebhookEvents(webhook._id);
    setIsEventsModalOpen(true);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row">
          <h1 className="text-md md:text-2xl font-bold text-gray-900">
            Webhooks
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your webhooks to receive real-time updates for chat events
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {/* Webhook Verification Example */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Webhook Signature Verification
        </h3>
        <p className="text-blue-700 text-sm mb-3">
          To verify webhook signatures, use the following code snippet:
        </p>
        <div className="bg-white rounded-md p-3 overflow-x-auto">
          <pre className="text-xs text-gray-800">
            {`// Node.js example
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return expectedSignature === signature;
}

// Usage
const payload = req.body;
const signature = req.headers['x-nexavelosai-signature'];
const secret = 'your-webhook-secret';

if (verifyWebhookSignature(payload, signature, secret)) {
  console.log('Webhook signature verified');
  // Process webhook
} else {
  console.log('Invalid webhook signature');
  // Reject webhook
}`}
          </pre>
        </div>
        <p className="text-blue-700 text-xs mt-2">
          Replace <code>your-webhook-secret</code> with the actual secret you
          set when creating the webhook.
        </p>
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

                {/* Domain */}
                {webhook.domain && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Domain
                    </h3>
                    <span className="text-sm text-gray-900">
                      {webhook.domain}
                    </span>
                  </div>
                )}

                {/* Agent ID */}
                {webhook.agentId && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Agent ID
                    </h3>
                    <span className="text-sm text-gray-900 font-mono">
                      {webhook.agentId}
                    </span>
                  </div>
                )}

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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook._id)}
                    className="flex items-center justify-center"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewEvents(webhook)}
                    className="flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Events
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedWebhook(webhook)}
                    className="flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteWebhook(webhook._id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center"
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
          isOpen={!!selectedWebhook && !isEventsModalOpen}
          onClose={() => setSelectedWebhook(null)}
          onSubmit={(data) => handleUpdateWebhook(selectedWebhook._id, data)}
          initialData={selectedWebhook}
          isEdit={true}
        />
      )}

      {isEventsModalOpen && selectedWebhook && (
        <EventsModal
          isOpen={isEventsModalOpen}
          onClose={() => setIsEventsModalOpen(false)}
          webhook={selectedWebhook}
          events={selectedWebhookEvents}
          loading={eventsLoading}
          page={eventsPage}
          totalPages={eventsTotalPages}
          onPageChange={(page) => fetchWebhookEvents(selectedWebhook._id, page)}
        />
      )}
    </div>
  );
}

function EventsModal({
  isOpen,
  onClose,
  webhook,
  events,
  loading,
  page,
  totalPages,
  onPageChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  webhook: Webhook;
  events: WebhookEvent[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failure":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "✓";
      case "failure":
        return "✗";
      case "pending":
        return "…";
      default:
        return "?";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Event History
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Webhook: {webhook.url}
            </p>
          </div>
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

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Events Found
              </h3>
              <p className="text-gray-600">
                This webhook has not processed any events yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Event Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Timestamp
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Response
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Retries
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              event.status,
                            )}`}
                          >
                            <span className="mr-1">
                              {getStatusIcon(event.status)}
                            </span>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {event.eventType}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {new Date(event.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-gray-500">
                          {event.responseStatus ? (
                            <span
                              className={
                                event.responseStatus >= 200 &&
                                event.responseStatus < 300
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {event.responseStatus}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {event.retryCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          p === page
                            ? "bg-blue-500 text-white border-blue-500"
                            : "text-gray-500 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
    domain: initialData?.domain || "",
    agentId: initialData?.agentId || "",
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
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
              Domain (Optional)
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, domain: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent ID (Optional)
            </label>
            <input
              type="text"
              value={formData.agentId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, agentId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional agent ID to filter events"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Events <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
