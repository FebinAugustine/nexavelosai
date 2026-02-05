"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Agent {
  _id: string;
  name: string;
  leadCapture: {
    enabled: boolean;
    trigger: "manual" | "time" | "messageCount";
    triggerValue: number;
    formFields: Array<{
      name: string;
      label: string;
      type: "text" | "email" | "phone" | "textarea";
      required: boolean;
      placeholder?: string;
    }>;
  };
}

export default function LeadCaptureSettings() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState<Agent["leadCapture"]>({
    enabled: false,
    trigger: "manual",
    triggerValue: 0,
    formFields: [],
  });

  // Fetch agent details
  const { data: agent, isLoading: agentLoading } = useQuery<Agent>({
    queryKey: ["agent", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/agents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  // Update lead capture settings mutation
  const updateLeadCaptureMutation = useMutation({
    mutationFn: async (settings: Agent["leadCapture"]) => {
      const token = localStorage.getItem("token");
      return axios.patch(
        `http://localhost:5000/agents/${id}/lead-capture`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      toast.success("Lead capture settings updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["agent", id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  useEffect(() => {
    if (agent) {
      setEditedSettings(agent.leadCapture);
    }
  }, [agent]);

  const handleSave = () => {
    updateLeadCaptureMutation.mutate(editedSettings);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (agent) {
      setEditedSettings(agent.leadCapture);
    }
  };

  const handleAddField = () => {
    setEditedSettings({
      ...editedSettings,
      formFields: [
        ...editedSettings.formFields,
        {
          name: `field${Date.now()}`,
          label: "New Field",
          type: "text",
          required: false,
          placeholder: "",
        },
      ],
    });
  };

  const handleRemoveField = (index: number) => {
    setEditedSettings({
      ...editedSettings,
      formFields: editedSettings.formFields.filter((_, i) => i !== index),
    });
  };

  const handleFieldChange = (
    index: number,
    field: Partial<Agent["leadCapture"]["formFields"][0]>,
  ) => {
    setEditedSettings({
      ...editedSettings,
      formFields: editedSettings.formFields.map((f, i) =>
        i === index ? { ...f, ...field } : f,
      ),
    });
  };

  if (agentLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Loading agent details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Lead Capture Settings - {agent?.name}
        </h1>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Settings
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          General Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="block text-sm font-medium text-gray-700">
              Enable Lead Capture
            </label>
            {isEditing ? (
              <input
                type="checkbox"
                checked={editedSettings.enabled}
                onChange={(e) =>
                  setEditedSettings({
                    ...editedSettings,
                    enabled: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            ) : (
              <span className="text-sm text-gray-600">
                {agent?.leadCapture.enabled ? "Enabled" : "Disabled"}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Type
            </label>
            {isEditing ? (
              <select
                value={editedSettings.trigger}
                onChange={(e) =>
                  setEditedSettings({
                    ...editedSettings,
                    trigger: e.target.value as Agent["leadCapture"]["trigger"],
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!editedSettings.enabled}
              >
                <option value="manual">Manual - Show form manually</option>
                <option value="time">Time Delay - Show after X seconds</option>
                <option value="messageCount">
                  Message Count - Show after X messages
                </option>
              </select>
            ) : (
              <p className="text-sm text-gray-600">
                {agent?.leadCapture.trigger === "manual" && "Manual"}
                {agent?.leadCapture.trigger === "time" && "Time Delay"}
                {agent?.leadCapture.trigger === "messageCount" &&
                  "Message Count"}
              </p>
            )}
          </div>

          {(editedSettings.trigger === "time" ||
            editedSettings.trigger === "messageCount") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Value
                {editedSettings.trigger === "time" && " (seconds)"}
                {editedSettings.trigger === "messageCount" && " (messages)"}
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedSettings.triggerValue}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      triggerValue: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editedSettings.enabled}
                />
              ) : (
                <p className="text-sm text-gray-600">
                  {agent?.leadCapture.triggerValue}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Form Fields</h2>
          {isEditing && (
            <button
              onClick={handleAddField}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              disabled={!editedSettings.enabled}
            >
              Add Field
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {editedSettings.formFields.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No form fields configured. Click "Add Field" to start.
              </div>
            ) : (
              editedSettings.formFields.map((field, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">
                      Field {index + 1}
                    </h3>
                    <button
                      onClick={() => handleRemoveField(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          handleFieldChange(index, { name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          handleFieldChange(index, { label: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleFieldChange(index, {
                            type: e.target
                              .value as Agent["leadCapture"]["formFields"][0]["type"],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="textarea">Text Area</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) =>
                          handleFieldChange(index, {
                            placeholder: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Required
                      </label>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          handleFieldChange(index, {
                            required: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {!agent?.leadCapture.formFields ||
            agent.leadCapture.formFields.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No form fields configured
              </div>
            ) : (
              agent.leadCapture.formFields.map((field, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                    <span className="text-sm text-gray-500">{field.type}</span>
                  </div>
                  {field.placeholder && (
                    <p className="text-sm text-gray-600 mt-1">
                      Placeholder: {field.placeholder}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Lead capture settings are per agent. Changes will affect all
                widgets using this agent.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
