"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Plus,
  Play,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Mail,
  Users,
  FileText,
  Clock,
} from "lucide-react";

interface EmailCampaign {
  _id: string;
  name: string;
  status: "draft" | "running" | "paused" | "completed" | "cancelled";
  recipients: number;
  emailsSent: number;
  emailsFailed: number;
  interval: number;
  createdAt: string;
  updatedAt?: string;
}

interface EmailTemplate {
  _id: string;
  name: string;
  category?: string;
  subject: string;
}

interface ContactList {
  _id: string;
  fileName: string;
  contactCount: number;
  columns: string[];
}

interface GoogleAccount {
  _id: string;
  email: string;
  name: string;
}

export default function EmailCampaignsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCampaign, setSelectedCampaign] =
    useState<EmailCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fromAccount: "",
    contactListId: "",
    templateId: "",
  });

  const queryClient = useQueryClient();

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["email-campaigns"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/email/campaigns",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
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

  // Fetch contact lists
  const { data: contactLists = [] } = useQuery({
    queryKey: ["contact-lists"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/email/contacts/lists",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    },
  });

  // Fetch Google accounts
  const { data: googleAccounts = [] } = useQuery({
    queryKey: ["google-accounts"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/email/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data || [];
    },
  });

  // Create campaign mutation
  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/email/campaigns",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      setIsCreateModalOpen(false);
      setCurrentStep(1);
      setFormData({
        name: "",
        fromAccount: "",
        contactListId: "",
        templateId: "",
      });
    },
  });

  // Delete campaign mutation
  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/email/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
    },
  });

  // Send campaign mutation
  const sendCampaign = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/email/campaigns/${id}/send`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
    },
  });

  // Handle form changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle create campaign
  const handleCreateCampaign = () => {
    createCampaign.mutate(formData);
  };

  // Handle send campaign
  const handleSendCampaign = (id: string) => {
    sendCampaign.mutate(id);
  };

  // Next step
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Open campaign details
  const openCampaignDetails = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: "Campaign Details" },
      { number: 2, label: "Select Contact List" },
      { number: 3, label: "Select Email Template" },
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    currentStep > step.number
                      ? "bg-green-500 text-white"
                      : currentStep === step.number
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? "✓" : step.number}
                </div>
                <div
                  className={`text-xs mt-2 font-medium ${
                    currentStep > step.number
                      ? "text-green-500"
                      : currentStep === step.number
                        ? "text-gray-800"
                        : "text-gray-500"
                  }`}
                >
                  {step.label}
                </div>
              </div>
              {step.number < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 transition-colors ${
                    currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">
              Campaign Details
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Name your campaign and select which account to send from
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                placeholder="e.g., January Newsletter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send From Account <span className="text-red-500">*</span>
              </label>
              <select
                name="fromAccount"
                value={formData.fromAccount}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
              >
                <option value="">Select an account</option>
                {googleAccounts.map((account: GoogleAccount) => (
                  <option key={account._id} value={account._id}>
                    {account.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">
              Select Contact List
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Choose which contacts to send this campaign to
            </p>

            <div className="space-y-3">
              {contactLists && contactLists.length > 0 ? (
                contactLists.map((list: ContactList) => (
                  <div
                    key={list._id}
                    onClick={() =>
                      setFormData({ ...formData, contactListId: list._id })
                    }
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.contactListId === list._id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-3 text-gray-500" />
                        <div>
                          <h5 className="font-medium text-gray-800">
                            {list.fileName}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {list.contactCount} contacts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {list.columns.slice(0, 3).map((column: string) => (
                          <span
                            key={column}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {column}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No contact lists available. Please create one first.
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">
              Select Email Template
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Choose the template for your campaign emails
            </p>

            <div className="space-y-3">
              {templates.map((template: EmailTemplate) => (
                <div
                  key={template._id}
                  onClick={() =>
                    setFormData({ ...formData, templateId: template._id })
                  }
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.templateId === template._id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <h5 className="font-medium text-gray-800">
                          {template.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {template.subject}
                        </p>
                      </div>
                    </div>
                    {template.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {template.category.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render campaign details
  const renderCampaignDetails = () => {
    if (!selectedCampaign) return null;

    const progress = Math.round(
      (selectedCampaign.emailsSent / selectedCampaign.recipients) * 100,
    );

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSendCampaign(selectedCampaign._id)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Campaign
                </button>
                <button
                  onClick={() => deleteCampaign.mutate(selectedCampaign._id)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCampaign.name}
              </h2>
              <div className="flex items-center mt-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  {selectedCampaign.status}
                </span>
                <span className="ml-3 text-sm text-gray-600">
                  Created:{" "}
                  {new Date(selectedCampaign.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Campaign Statistics */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedCampaign.recipients}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedCampaign.emailsSent}
                  </div>
                  <div className="text-sm text-gray-600">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedCampaign.emailsFailed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedCampaign.recipients - selectedCampaign.emailsSent}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedCampaign.interval}m
                  </div>
                  <div className="text-sm text-gray-600">Interval</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Sending From</h4>
                </div>
                <p className="text-sm text-gray-600">gsdulat@gmail.com</p>
                <p className="text-xs text-gray-500">Gets Support</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Contact List</h4>
                </div>
                <p className="text-sm text-gray-600">emails</p>
                <p className="text-xs text-gray-500">3 contacts</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Template</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Professional Introduction
                </p>
                <p className="text-xs text-gray-500">
                  Introduction: {`{{name}}`} from {`{{company}}`}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Campaign Created
                    </p>
                    <p className="text-xs text-gray-500">
                      Your campaign is ready to start.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your email campaigns
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">✉️</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              No campaigns yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first email campaign to get started
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign: EmailCampaign) => (
            <div
              key={campaign._id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              onClick={() => openCampaignDetails(campaign)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      {campaign.status}
                    </span>
                    <span className="ml-3 text-sm text-gray-600">
                      Created:{" "}
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendCampaign(campaign._id);
                    }}
                    className="px-3 py-2 bg-indigo-100 text-indigo-600 rounded-md text-sm hover:bg-indigo-200 transition-colors flex items-center"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCampaign.mutate(campaign._id);
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Campaign Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {campaign.recipients}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {campaign.emailsSent}
                  </div>
                  <div className="text-xs text-gray-600">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {campaign.emailsFailed}
                  </div>
                  <div className="text-xs text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {campaign.recipients - campaign.emailsSent}
                  </div>
                  <div className="text-xs text-gray-600">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {campaign.interval}m
                  </div>
                  <div className="text-xs text-gray-600">Interval</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      (campaign.emailsSent / campaign.recipients) * 100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.round((campaign.emailsSent / campaign.recipients) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Create Campaign
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Set up a new email campaign in 3 easy steps
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCurrentStep(1);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-4">{renderStepIndicator()}</div>

            {/* Step Content */}
            <div className="px-6 py-4">{renderStepContent()}</div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center p-6 border-t">
              <button
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 &&
                      (!formData.name || !formData.fromAccount)) ||
                    (currentStep === 2 && !formData.contactListId) ||
                    (currentStep === 3 && !formData.templateId)
                  }
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    (currentStep === 1 &&
                      (!formData.name || !formData.fromAccount)) ||
                    (currentStep === 2 && !formData.contactListId) ||
                    (currentStep === 3 && !formData.templateId)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleCreateCampaign}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Create Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {renderCampaignDetails()}
    </div>
  );
}
