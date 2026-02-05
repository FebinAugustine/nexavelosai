"use client";

import { useState, useEffect } from "react";
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

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  agentId,
  agentName,
}: LeadCaptureModalProps) {
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
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/agents/${agentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    enabled: isOpen,
  });

  // Update lead capture settings mutation
  const updateLeadCaptureMutation = useMutation({
    mutationFn: async (settings: Agent["leadCapture"]) => {
      const token = localStorage.getItem("token");
      return axios.patch(
        `http://localhost:5000/agents/${agentId}/lead-capture`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      toast.success("Lead capture settings updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
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

  if (!isOpen) return null;

  if (agentLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Lead Capture Settings
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-full"
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
          </div>
          <div className="p-6">
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-gray-500">Loading agent details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200/50 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Lead Capture Settings
                </h3>
                <p className="text-indigo-100 text-sm">{agentName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-full"
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
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Settings
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-200/50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              General Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                ) : (
                  <span className="text-sm text-gray-600">
                    {agent?.leadCapture.enabled ? "Enabled" : "Disabled"}
                  </span>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Trigger Type
                </label>
                {isEditing ? (
                  <select
                    value={editedSettings.trigger}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        trigger: e.target
                          .value as Agent["leadCapture"]["trigger"],
                      })
                    }
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                    disabled={!editedSettings.enabled}
                  >
                    <option value="manual">Manual - Show form manually</option>
                    <option value="time">
                      Time Delay - Show after X seconds
                    </option>
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
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-600"
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
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

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Form Fields
              </h2>
              {isEditing && (
                <button
                  onClick={handleAddField}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  disabled={!editedSettings.enabled}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
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
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-white/70 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900">
                          Field {index + 1}
                        </h3>
                        <button
                          onClick={() => handleRemoveField(index)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
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
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
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
                              handleFieldChange(index, {
                                label: e.target.value,
                              })
                            }
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
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
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
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
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
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
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
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
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-white/70 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {field.type}
                        </span>
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
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
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
      </div>
    </div>
  );
}
