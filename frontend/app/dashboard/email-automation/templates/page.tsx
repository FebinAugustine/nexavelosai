"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";

interface EmailTemplate {
  _id: string;
  name: string;
  category?: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export default function EmailTemplatesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subject: "",
    content: "",
  });

  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/email/templates",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/email/templates",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setIsCreateModalOpen(false);
      setFormData({ name: "", category: "", subject: "", content: "" });
    },
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/email/templates/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setIsEditModalOpen(false);
      setSelectedTemplate(null);
      setFormData({ name: "", category: "", subject: "", content: "" });
    },
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/email/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });

  // Handle form changes
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle create template
  const handleCreateTemplate = () => {
    createTemplate.mutate(formData);
  };

  // Handle edit template
  const handleEditTemplate = () => {
    if (!selectedTemplate) return;
    updateTemplate.mutate({ id: selectedTemplate._id, data: formData });
  };

  // Open edit modal
  const openEditModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category || "",
      subject: template.subject,
      content: template.content,
    });
    setIsEditModalOpen(true);
  };

  // Render preview content
  const renderPreview = () => {
    const { subject, content } = formData;
    const previewSubject = subject.replace(/\{\{([^}]+)\}\}/g, "[${1}]");
    const previewContent = content.replace(/\{\{([^}]+)\}\}/g, "[${1}]");

    return (
      <div className="h-full flex flex-col">
        <div className="bg-white rounded-lg border p-4 flex-1 overflow-auto">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Subject:</div>
            <div className="font-medium">{previewSubject || "No subject"}</div>
          </div>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: previewContent || "<p>No content</p>",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your email templates
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-gray-600 mb-6">Create one to get started</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: EmailTemplate) => (
            <div
              key={template._id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {template.name}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {template.category && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {template.category.toLowerCase()}
                  </span>
                )}
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  Default
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                Subject: {template.subject}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => {}}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => openEditModal(template)}
                  className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-md text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => deleteTemplate.mutate(template._id)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {isCreateModalOpen ? "Create Template" : "Edit Template"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isCreateModalOpen
                    ? "Create a new email template"
                    : "Modify your email template"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedTemplate(null);
                  }}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="mr-1">×</span>
                  Cancel
                </button>
                <button
                  onClick={
                    isCreateModalOpen
                      ? handleCreateTemplate
                      : handleEditTemplate
                  }
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save Template
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Template Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Template Details
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter template name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        <option value="introduction">Introduction</option>
                        <option value="followup">Follow-up</option>
                        <option value="sales">Sales</option>
                        <option value="marketing">Marketing</option>
                        <option value="newsletter">Newsletter</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter email subject"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Body (HTML) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                        rows={12}
                        placeholder="Enter email content"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Preview</h4>
                {renderPreview()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
