"use client";

import { useState, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function WhatsAppTemplatesContent() {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    category: "MARKETING",
    languageCode: "en_US",
    components: [{ type: "body", text: "" }],
  });

  const queryClient = useQueryClient();

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

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/whatsapp/templates",
        templateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappTemplates"] });
      setShowCreateForm(false);
      setIsCreating(false);
      setCreateFormData({
        name: "",
        category: "MARKETING",
        languageCode: "en_US",
        components: [{ type: "body", text: "" }],
      });
    },
    onError: (error: any) => {
      console.error("Error creating template:", error);
      setIsCreating(false);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/whatsapp/templates/${templateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappTemplates"] });
    },
    onError: (error: any) => {
      console.error("Error deleting template:", error);
    },
  });

  const syncTemplatesMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/whatsapp/templates/sync",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappTemplates"] });
    },
    onError: (error: any) => {
      console.error("Error syncing templates:", error);
    },
  });

  const handleCreateTemplate = async () => {
    setIsCreating(true);
    try {
      await createTemplateMutation.mutateAsync(createFormData);
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplateMutation.mutateAsync(templateId);
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const handleSyncTemplates = async () => {
    try {
      await syncTemplatesMutation.mutateAsync();
    } catch (error) {
      console.error("Error syncing templates:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            N/A
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Message Templates</h1>
          <p className="text-black">
            Manage your WhatsApp Business message templates
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSyncTemplates}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Sync Templates
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            + Create Template
          </button>
        </div>
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-black">
            Create New Template
          </h3>
          <p className="text-black mb-6">
            Create a new message template. Templates need to be approved by
            WhatsApp before they can be used.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="welcome_message"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Category
                </label>
                <select
                  value={createFormData.category}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Language Code
                </label>
                <select
                  value={createFormData.languageCode}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      languageCode: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="en_US">English (US)</option>
                  <option value="en_GB">English (GB)</option>
                  <option value="es_ES">Spanish</option>
                  <option value="fr_FR">French</option>
                  <option value="de_DE">German</option>
                  <option value="it_IT">Italian</option>
                  <option value="pt_BR">Portuguese (Brazil)</option>
                </select>
              </div>
            </div>

            {/* Components */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Template Content
              </label>
              <div className="space-y-3">
                {/* Body Component */}
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Body Text
                  </label>
                  <textarea
                    value={
                      createFormData.components.find((c) => c.type === "body")
                        ?.text || ""
                    }
                    onChange={(e) => {
                      const updatedComponents = [...createFormData.components];
                      const bodyComponent = updatedComponents.find(
                        (c) => c.type === "body",
                      );
                      if (bodyComponent) {
                        bodyComponent.text = e.target.value;
                      } else {
                        updatedComponents.push({
                          type: "body",
                          text: e.target.value,
                        });
                      }
                      setCreateFormData({
                        ...createFormData,
                        components: updatedComponents,
                      });
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Hello {{1}}! Thank you for signing up. {{2}}"
                  />
                </div>

                {/* Header Component */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeHeader"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCreateFormData({
                          ...createFormData,
                          components: [
                            ...createFormData.components,
                            { type: "header", text: "" },
                          ],
                        });
                      } else {
                        setCreateFormData({
                          ...createFormData,
                          components: createFormData.components.filter(
                            (c) => c.type !== "header",
                          ),
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="includeHeader"
                    className="text-sm font-medium text-black"
                  >
                    Include Header
                  </label>
                </div>

                {/* Footer Component */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeFooter"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCreateFormData({
                          ...createFormData,
                          components: [
                            ...createFormData.components,
                            { type: "footer", text: "" },
                          ],
                        });
                      } else {
                        setCreateFormData({
                          ...createFormData,
                          components: createFormData.components.filter(
                            (c) => c.type !== "footer",
                          ),
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="includeFooter"
                    className="text-sm font-medium text-black"
                  >
                    Include Footer
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleCreateTemplate}
                disabled={isCreating || !createFormData.name}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Template"}
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

      {/* Templates List */}
      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: any) => (
            <div
              key={template._id}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    {template.name}
                  </h3>
                  <p className="text-sm text-black">{template.languageCode}</p>
                  <p className="text-sm text-black">
                    Category:{" "}
                    <span className="font-medium">{template.category}</span>
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(template.status)}
                  {template.lastApprovedAt && (
                    <p className="text-xs text-black mt-1">
                      Approved{" "}
                      {new Date(template.lastApprovedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                {/* Header */}
                {template.components?.find((c: any) => c.type === "header") && (
                  <div className="mb-2 text-black">
                    {
                      template.components.find((c: any) => c.type === "header")
                        .text
                    }
                  </div>
                )}

                {/* Body */}
                {template.components?.find((c: any) => c.type === "body") && (
                  <div className="mb-2 text-black">
                    {
                      template.components.find((c: any) => c.type === "body")
                        .text
                    }
                  </div>
                )}

                {/* Footer */}
                {template.components?.find((c: any) => c.type === "footer") && (
                  <div className="text-sm text-black">
                    {
                      template.components.find((c: any) => c.type === "footer")
                        .text
                    }
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {template.rejectionReason && (
                <div className="bg-red-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-red-600">
                    {template.rejectionReason}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeleteTemplate(template._id)}
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
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">No templates created</h3>
          <p className="text-black mb-8">
            Create your first WhatsApp message template to start sending
            campaigns
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            + Create Template
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
              About Message Templates
            </h3>
            <p className="text-black mb-2">
              • All outgoing messages must use pre-approved templates
            </p>
            <p className="text-black mb-2">
              • Templates can take 1-2 business days to get approved
            </p>
            <p className="text-black mb-2">
              • Use {"{{1}}"}, {"{{2}}"}, etc. to indicate variables in your
              templates
            </p>
            <p className="text-black">
              • Templates are reviewed by WhatsApp for compliance with their
              policies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppTemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Message Templates</h1>
              <p className="text-black">
                Manage your WhatsApp Business message templates
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      }
    >
      <WhatsAppTemplatesContent />
    </Suspense>
  );
}
