"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useSocket } from "../socket-context";
import {
  sanitizeTextInput,
  sanitizeAndValidateInput,
  countWords,
  isValidAgentName,
  isValidDomain,
  isValidPassword,
} from "../../lib/sanitization";

interface User {
  email: string;
  plan: string;
  agentLimit: number;
  domains: string[];
}

interface Agent {
  _id: string;
  name: string;
  description?: string;
  provider: string;
  domain?: string;
  chatCount: number;
  totalInteractions: number;
}

interface Analytics {
  totalAgents: number;
  totalChats: number;
  totalInteractions: number;
  agents: {
    id: string;
    name: string;
    chatCount: number;
    totalInteractions: number;
  }[];
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "agent"; content: string }[]
  >([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAgentForEdit, setSelectedAgentForEdit] =
    useState<Agent | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [snippetModalOpen, setSnippetModalOpen] = useState(false);
  const [selectedAgentForSnippet, setSelectedAgentForSnippet] =
    useState<Agent | null>(null);
  const [snippetVersion, setSnippetVersion] = useState("full");
  // Create Agent form state
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentApiKey, setAgentApiKey] = useState("");
  const [agentProvider, setAgentProvider] = useState("gemini");
  const [agentDomain, setAgentDomain] = useState("");
  const [createAgentLoading, setCreateAgentLoading] = useState(false);
  // Account settings state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [accountSettingsLoading, setAccountSettingsLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const router = useRouter();
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user profile, agents, and analytics
    const fetchData = async () => {
      try {
        const [userResponse, agentsResponse, analyticsResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/auth/profile", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/agents", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/agents/analytics", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        setUser(userResponse.data);
        setAgents(agentsResponse.data);
        setAnalytics(analyticsResponse.data);
      } catch (error) {
        toast.error("Failed to load data");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (socket) {
      socket.on("analyticsUpdate", (data: Analytics) => {
        setAnalytics(data);
      });

      return () => {
        socket.off("analyticsUpdate");
      };
    }
  }, [socket]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/agents/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Agent deleted successfully!");
      setAgents(agents.filter((agent) => agent._id !== agentId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete agent");
    }
  };

  const handleTestAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setTestModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedAgent) return;

    const userMessage = { role: "user" as const, content: chatMessage };
    setMessages((prev) => [...prev, userMessage]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/agents/${selectedAgent._id}/chat`,
        {
          message: userMessage.content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const agentMessage = {
        role: "agent" as const,
        content: response.data.response,
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setChatLoading(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgentForEdit(agent);
    setEditName(agent.name);
    setEditDescription(agent.description || "");
    setEditDomain(agent.domain || "");
    setEditModalOpen(true);
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgentForEdit) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/agents/${selectedAgentForEdit._id}`,
        {
          name: editName,
          description: editDescription,
          domain: editDomain,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Agent updated successfully!");
      setAgents(
        agents.map((agent) =>
          agent._id === selectedAgentForEdit._id ? response.data : agent,
        ),
      );
      setEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update agent");
    }
  };

  const handleGetSnippet = (agent: Agent) => {
    setSelectedAgentForSnippet(agent);
    // Set default snippet version based on user plan
    if (user?.plan === "special") {
      setSnippetVersion("full");
    } else {
      setSnippetVersion("short");
    }
    setSnippetModalOpen(true);
  };

  const handleCopySnippet = async (type: string) => {
    if (!selectedAgentForSnippet) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/agents/${selectedAgentForSnippet._id}/snippet?type=${type}&version=${snippetVersion}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const snippet = response.data.snippet;
      // Copy to clipboard or show in alert
      navigator.clipboard
        .writeText(snippet)
        .then(() => {
          toast.success(`${type.toUpperCase()} snippet copied to clipboard!`);
          setSnippetModalOpen(false);
        })
        .catch(() => {
          alert(`Copy this code to your website:\n\n${snippet}`);
          setSnippetModalOpen(false);
        });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to get snippet");
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize and validate inputs
    const sanitizedName = sanitizeAndValidateInput(agentName, {
      maxLength: 100,
      fieldName: "Agent name",
    });
    if (!sanitizedName.isValid) {
      toast.error(sanitizedName.error!);
      return;
    }

    if (!isValidAgentName(sanitizedName.sanitized)) {
      toast.error(
        "Agent name can only contain letters, numbers, spaces, hyphens, and underscores",
      );
      return;
    }

    const sanitizedDescription = sanitizeAndValidateInput(agentDescription, {
      maxLength: 50000,
      fieldName: "Description",
    });
    if (!sanitizedDescription.isValid) {
      toast.error(sanitizedDescription.error!);
      return;
    }

    // Check word count for description
    if (countWords(sanitizedDescription.sanitized) > 1000) {
      toast.error("Description must not exceed 1000 words");
      return;
    }

    const sanitizedApiKey = sanitizeAndValidateInput(agentApiKey, {
      maxLength: 1000,
      fieldName: "API key",
    });
    if (!sanitizedApiKey.isValid) {
      toast.error(sanitizedApiKey.error!);
      return;
    }

    const sanitizedDomain = sanitizeTextInput(agentDomain).toLowerCase();
    if (!sanitizedDomain) {
      toast.error("Domain is required");
      return;
    }
    if (!isValidDomain(sanitizedDomain)) {
      toast.error("Please enter a valid domain format");
      return;
    }

    setCreateAgentLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      await axios.post(
        "http://localhost:5000/agents",
        {
          name: sanitizedName.sanitized,
          description: sanitizedDescription.sanitized,
          apiKey: sanitizedApiKey.sanitized,
          provider: agentProvider,
          domain: sanitizedDomain || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Agent created successfully!");
      // Reset form
      setAgentName("");
      setAgentDescription("");
      setAgentApiKey("");
      setAgentProvider("gemini");
      setAgentDomain("");
      // Switch back to dashboard
      setActiveSection("dashboard");
      // Refresh agents list
      const agentsResponse = await axios.get("http://localhost:5000/agents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents(agentsResponse.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create agent");
    } finally {
      setCreateAgentLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const sanitizedCurrentPassword = sanitizeTextInput(currentPassword);
    const sanitizedNewPassword = sanitizeTextInput(newPassword);
    const sanitizedConfirmPassword = sanitizeTextInput(confirmPassword);

    // Validate
    if (!sanitizedCurrentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!isValidPassword(sanitizedNewPassword)) {
      toast.error(
        "New password must be at least 6 characters long and contain both letters and numbers",
      );
      return;
    }

    if (sanitizedNewPassword !== sanitizedConfirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (sanitizedCurrentPassword === sanitizedNewPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setAccountSettingsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        "http://localhost:5000/auth/change-password",
        {
          currentPassword: sanitizedCurrentPassword,
          newPassword: sanitizedNewPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setAccountSettingsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Sanitize confirmation input
    const sanitizedConfirmation =
      sanitizeTextInput(deleteConfirmation).toUpperCase();

    if (sanitizedConfirmation !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm account deletion");
      return;
    }

    setAccountSettingsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/auth/account", {
        headers: { Authorization: `Bearer ${token}` },
        data: { confirmation: sanitizedConfirmation },
      });
      toast.success("Account deleted successfully!");
      localStorage.removeItem("token");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setAccountSettingsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Dashboard
              </h2>
              <p className="text-lg text-gray-600">
                Welcome back! Here's an overview of your AI agents.
              </p>
            </div>

            {/* User Info */}
            <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 mb-8">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Account Information
                  </h3>
                </div>
              </div>
              <div className="px-6 py-8 sm:p-8">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                      <svg
                        className="w-4 h-4 mr-2 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Email
                    </dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      {user?.email}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                      <svg
                        className="w-4 h-4 mr-2 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                      Plan
                    </dt>
                    <dd className="text-sm text-gray-900 font-medium capitalize">
                      {user?.plan}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                      <svg
                        className="w-4 h-4 mr-2 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Agent Limit
                    </dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      {user?.agentLimit}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                      <svg
                        className="w-4 h-4 mr-2 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-1.657 0-3-1.343-3-3s1.343-3 3-3m0-3c1.657 0 3 1.343 3 3s-1.343 3-3 3"
                        />
                      </svg>
                      Domains
                    </dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      {user?.domains.length ? user.domains.join(", ") : "None"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Agents Overview */}
            <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 mb-8">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    AI Agents ({agents.length})
                  </h3>
                </div>
              </div>
              <div className="px-6 py-8 sm:p-8">
                {agents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-lg font-medium mb-2">
                      No AI agents yet
                    </p>
                    <p className="text-gray-500 mb-6">
                      Create your first AI agent to get started with intelligent
                      chatbots.
                    </p>
                    <button
                      onClick={() => setActiveSection("create-agent")}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                    >
                      Create Your First Agent
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {agents.map((agent) => (
                      <div
                        key={agent._id}
                        className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <div className="flex flex-col justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-indigo-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {agent.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {agent.description}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4 text-indigo-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                                <span className="text-gray-600">Provider:</span>
                                <span className="font-medium text-gray-900">
                                  {agent.provider}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4 text-indigo-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-1.657 0-3-1.343-3-3s1.343-3 3-3m0-3c1.657 0 3 1.343 3 3s-1.343 3-3 3"
                                  />
                                </svg>
                                <span className="text-gray-600">Domain:</span>
                                <span className="font-medium text-gray-900">
                                  {agent.domain || "Not set"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 md:ml-10">
                                <svg
                                  className="w-4 h-4 text-indigo-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                                <span className="text-gray-600">Chats:</span>{" "}
                                <br />
                                <span className="font-medium text-gray-900">
                                  {agent.chatCount} | Interactions:{" "}
                                  {agent.totalInteractions}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-4">
                            <button
                              onClick={() => handleTestAgent(agent)}
                              className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-sm"
                            >
                              Test Agent
                            </button>
                            <button
                              onClick={() => handleGetSnippet(agent)}
                              className="bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors duration-200 font-medium text-sm"
                            >
                              Get Snippet
                            </button>
                            <button
                              onClick={() => handleEditAgent(agent)}
                              className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors duration-200 font-medium text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agent._id)}
                              className="bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        );
      case "analytics":
        return (
          <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Analytics Overview
                </h3>
              </div>
            </div>
            <div className="px-6 py-8 sm:p-8">
              {analytics ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200/50 shadow-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
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
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-indigo-700">
                            Total Agents
                          </h4>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-indigo-900">
                        {analytics.totalAgents}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200/50 shadow-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
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
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-green-700">
                            Total Chats
                          </h4>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-green-900">
                        {analytics.totalChats}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50 shadow-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
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
                              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0V1m10 3V1m0 3l1 1v16a2 2 0 01-2 2H6a2 2 0 01-2-2V5l1-1z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-700">
                            Total Interactions
                          </h4>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-900">
                        {analytics.totalInteractions}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
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
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      Agent Performance
                    </h4>
                    <div className="space-y-4">
                      {analytics.agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-indigo-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900 text-lg">
                                  {agent.name}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Chats:</span>{" "}
                                {agent.chatCount}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">
                                  Interactions:
                                </span>{" "}
                                {agent.totalInteractions}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">
                    Loading analytics...
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case "documentation":
        return (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Widget Integration Documentation
              </h2>
              <p className="text-lg text-gray-600">
                Complete guide to embedding NexaVelosAI chat widgets on your
                website
              </p>
            </div>

            <div className="space-y-8">
              {/* Overview */}
              <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 md:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-white"
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
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      Widget Overview
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-8 sm:p-8">
                  <p className="text-gray-700 mb-4">
                    NexaVelosAI provides two types of widget implementations to
                    suit different integration needs:
                  </p>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-3 md:p-4 rounded-lg border border-blue-200/50">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Short Snippet (External Script)
                      </h4>
                      <p className="text-sm text-blue-800">
                        Lightweight implementation that loads the widget script
                        from our servers. Recommended for most websites.
                      </p>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100 p-3 md:p-4 rounded-lg border border-purple-200/50">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Full Snippet (Inline Code)
                      </h4>
                      <p className="text-sm text-purple-800">
                        Complete widget code embedded directly. Offers maximum
                        customization but requires more setup. Available for
                        Special plan users only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* JavaScript Implementation */}
              <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 mb-8">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 md:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      JavaScript Implementation
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-8 sm:p-8 space-y-6">
                  {/* Short Snippet */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Short Snippet (Recommended)
                    </h4>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200 mb-4 overflow-hidden">
                      <pre className="text-xs md:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                        <code>{`<!-- NexaVelosAI Widget Short Code -->
<!-- To customize the widget, add CSS overrides in your website's styles -->
<!-- Example customizations:
<style>
.nexavel-chat-widget { z-index: 999999 !important; }
.nexavel-chat-button { bottom: 30px !important; right: 30px !important; }
</style>
-->
<script>window.nexavelAgentId = 'YOUR_AGENT_ID'; window.nexavelApiUrl = 'http://localhost:5000';</script><script src="http://localhost:5000/widget.js"></script>`}</code>
                      </pre>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">
                        Implementation Steps:
                      </h5>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Copy the code snippet above</li>
                        <li>
                          Replace{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            YOUR_AGENT_ID
                          </code>{" "}
                          with your actual agent ID
                        </li>
                        <li>
                          Paste the code just before the closing{" "}
                          <code className="bg-gray-100 px-1 rounded">{`</body>`}</code>{" "}
                          tag on your website
                        </li>
                        <li>The widget will automatically load and display</li>
                      </ol>
                    </div>
                  </div>

                  {/* Full Snippet */}
                  {user?.plan === "special" && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Full Snippet (Special Plan Only)
                      </h4>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 md:p-4 rounded-lg border border-purple-200 mb-4 overflow-hidden">
                        <p className="text-xs md:text-sm text-purple-800 mb-3">
                          <strong>Note:</strong> Full snippet implementation
                          requires a Special plan subscription. It provides
                          complete control over the widget appearance and
                          behavior.
                        </p>
                        <pre className="text-xs md:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                          <code>{`<script>
(function () {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Agent ID is embedded in the snippet
    const agentId = 'YOUR_AGENT_ID';

    // Create widget HTML and styles...
    // [Complete inline implementation code]
  }
})();
</script>`}</code>
                        </pre>
                      </div>
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">
                          Advantages:
                        </h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          <li>No external dependencies</li>
                          <li>Complete customization control</li>
                          <li>Faster initial load</li>
                          <li>Works offline (after initial load)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* React/Next.js Implementation */}
              <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 md:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      React/Next.js Implementation
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-8 sm:p-8 space-y-6">
                  {/* Short Component */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Short Component (Recommended)
                    </h4>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200 mb-4 overflow-hidden">
                      <pre className="text-xs md:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                        <code>{`'use client';

import { useEffect } from 'react';

export default function NexaVelosAIWidget({ agentId }: { agentId: string }) {
  useEffect(() => {
    // Set global agent ID and API URL
    (window as any).nexavelAgentId = agentId;
    (window as any).nexavelApiUrl = 'http://localhost:5000';

    // Load widget script
    const script = document.createElement('script');
    script.src = 'http://localhost:5000/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
      delete (window as any).nexavelAgentId;
      delete (window as any).nexavelApiUrl;
    };
  }, [agentId]);

  return null;
}`}</code>
                      </pre>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Usage:</h5>
                      <pre className="bg-gray-50 p-3 rounded text-sm text-gray-800">
                        <code>{`<NexaVelosAIWidget agentId="YOUR_AGENT_ID" />`}</code>
                      </pre>
                      <p className="text-gray-700 text-sm">
                        Add this component to your React/Next.js application.
                        The widget will automatically initialize when the
                        component mounts.
                      </p>
                    </div>
                  </div>

                  {/* Full Component */}
                  {user?.plan === "special" && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Full Component (Special Plan Only)
                      </h4>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 mb-4">
                        <p className="text-sm text-purple-800 mb-3">
                          Complete React component with full widget
                          implementation. Requires Special plan.
                        </p>
                        <pre className="text-xs md:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                          <code>{`'use client';

import { useState, useEffect } from 'react';

export default function NexaVelosAIWidget({ agentId }: { agentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Complete component implementation...
  return (
    <>
      <style jsx>{\`
        .nexavel-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          // Complete styles...
        }
        // ... more styles
      \`}</style>
      <div className="nexavel-chat-widget">
        <button className="nexavel-chat-button" onClick={() => setIsOpen(!isOpen)}>
          💬
        </button>
        {/* Complete chat interface */}
      </div>
    </>
  );
}`}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customization */}
              {user?.plan === "special" && (
                <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 md:p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white">
                        Customization Options
                      </h3>
                    </div>
                  </div>
                  <div className="px-6 py-8 sm:p-8">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          CSS Customization
                        </h4>
                        <pre className="bg-gray-50 p-2 md:p-3 rounded text-xs md:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                          <code>{`/* Position adjustments */
.nexavel-chat-widget {
  bottom: 30px !important;
  right: 30px !important;
}

/* Button styling */
.nexavel-chat-button {
  width: 70px !important;
  height: 70px !important;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4) !important;
}

/* Chat window */
.nexavel-chat-window {
  width: 400px !important;
  height: 650px !important;
}`}</code>
                        </pre>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          JavaScript API
                        </h4>
                        <pre className="bg-gray-50 p-2 md:p-3 rounded text-xs md:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                          <code>{`// Programmatically control the widget
window.nexavelWidget = {
  open: () => {/* open chat */},
  close: () => {/* close chat */},
  sendMessage: (msg) => {/* send message */},
  onMessage: (callback) => {/* message handler */}
};

// Example usage
window.nexavelWidget.open();`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Troubleshooting */}
              <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 mb-8">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 md:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      Troubleshooting
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-8 sm:p-8">
                  <div className="space-y-3 md:space-y-4">
                    <div className="border-l-4 border-red-400 bg-red-50 p-3 md:p-4">
                      <h5 className="font-medium text-red-800 text-sm md:text-base">
                        Widget not appearing?
                      </h5>
                      <ul className="text-xs md:text-sm text-red-700 mt-2 space-y-1">
                        <li>• Check that the agent ID is correct</li>
                        <li>• Ensure the script is loaded before DOM ready</li>
                        <li>• Verify no CSS conflicts hiding the widget</li>
                        <li>• Check browser console for JavaScript errors</li>
                      </ul>
                    </div>
                    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-3 md:p-4">
                      <h5 className="font-medium text-yellow-800 text-sm md:text-base">
                        Messages not sending?
                      </h5>
                      <ul className="text-xs md:text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Verify API URL is accessible</li>
                        <li>• Check network connectivity</li>
                        <li>• Ensure agent is properly configured</li>
                        <li>• Review rate limiting (if applicable)</li>
                      </ul>
                    </div>
                    <div className="border-l-4 border-blue-400 bg-blue-50 p-3 md:p-4">
                      <h5 className="font-medium text-blue-800 text-sm md:text-base">
                        Styling issues?
                      </h5>
                      <ul className="text-xs md:text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Use !important for CSS overrides</li>
                        <li>• Check for z-index conflicts</li>
                        <li>• Ensure proper CSS specificity</li>
                        <li>• Test on different screen sizes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case "account":
        return (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Account Settings
              </h2>
              <p className="text-lg text-gray-600">
                Manage your account details, security, and preferences.
              </p>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* Profile Information */}
              <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Profile Information
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-8 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                        {user?.email}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Status
                      </label>
                      <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800 font-medium flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Active
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Change Password
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-8 sm:p-8">
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          required
                          className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          required
                          className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={accountSettingsLoading}
                        className="inline-flex items-center px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {accountSettingsLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Changing Password...
                          </>
                        ) : (
                          <>
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
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                              />
                            </svg>
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Delete Account */}
              <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-red-200/50">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Delete Account
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-8 sm:p-8">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-lg font-semibold text-red-800 mb-2">
                          Danger Zone
                        </h4>
                        <p className="text-red-700 text-sm">
                          Deleting your account is permanent and cannot be
                          undone. All your agents, data, and billing history
                          will be permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="deleteConfirmation"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Type "DELETE" to confirm
                      </label>
                      <input
                        type="text"
                        id="deleteConfirmation"
                        className="block w-full px-4 py-3 border border-red-300 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                        placeholder="Type DELETE to confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={
                          accountSettingsLoading ||
                          deleteConfirmation !== "DELETE"
                        }
                        className="inline-flex items-center px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {accountSettingsLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Deleting Account...
                          </>
                        ) : (
                          <>
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Account
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case "create-agent":
        if (user?.plan === "free" && agents.length > 0) {
          return (
            <>
              <div className="mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                  Upgrade Your Plan
                </h2>
                <p className="text-lg text-gray-600">
                  Unlock the ability to create more AI agents and access
                  advanced features
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
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
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Upgrade to Create More Agents
                    </h3>
                    <p className="text-indigo-100">
                      Your current Free plan allows you to create and manage
                      your existing agents, but to create additional AI agents,
                      please upgrade to a paid plan.
                    </p>
                  </div>
                </div>

                <div className="p-8">
                  <div className="text-center">
                    <p className="text-gray-600 mb-8">
                      Choose from our flexible plans designed to scale with your
                      business needs.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        onClick={() => setActiveSection("billing")}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                      >
                        View Plans & Upgrade
                      </button>
                      <button
                        onClick={() => setActiveSection("dashboard")}
                        className="bg-white/70 backdrop-blur-md border border-gray-200/50 text-gray-700 px-8 py-3 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        }

        return (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Create Your AI Agent
              </h2>
              <p className="text-lg text-gray-600">
                Build and deploy intelligent chatbots powered by advanced AI
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Agent Configuration
                  </h3>
                </div>
              </div>
              <div className="px-6 py-8 sm:p-8">
                <form onSubmit={handleCreateAgent} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="agentName"
                        className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                      >
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Agent Name
                      </label>
                      <input
                        type="text"
                        id="agentName"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                        placeholder="Enter a unique name for your agent"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="agentDescription"
                        className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                      >
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Description
                      </label>
                      <textarea
                        id="agentDescription"
                        rows={4}
                        maxLength={50000}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="Describe what your agent does and its capabilities (max 1000 words)"
                        value={agentDescription}
                        onChange={(e) => setAgentDescription(e.target.value)}
                      />
                      <div className="mt-2 flex justify-between text-sm text-gray-500">
                        <span>{countWords(agentDescription)} / 1000 words</span>
                        <span>
                          {agentDescription.length} / 50000 characters
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="agentProvider"
                        className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                      >
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
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        AI Provider
                      </label>
                      <select
                        id="agentProvider"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900"
                        value={agentProvider}
                        onChange={(e) => setAgentProvider(e.target.value)}
                      >
                        <option value="gemini">🤖 Google Gemini</option>
                        <option value="chatgpt">🧠 OpenAI ChatGPT</option>
                        <option value="openrouter">🌐 OpenRouter</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="agentDomain"
                        className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                      >
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
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-1.657 0-3-1.343-3-3s1.343-3 3-3m0-3c1.657 0 3 1.343 3 3s-1.343 3-3 3"
                          />
                        </svg>
                        Domain
                      </label>
                      <input
                        type="text"
                        id="agentDomain"
                        required
                        placeholder="e.g., example.com"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                        value={agentDomain}
                        onChange={(e) => setAgentDomain(e.target.value)}
                      />
                      <p className="mt-2 text-sm text-gray-500 flex items-center">
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
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Restrict agent usage to specific domains for security
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="agentApiKey"
                        className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                      >
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
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                        API Key
                      </label>
                      <input
                        type="password"
                        id="agentApiKey"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                        placeholder="Enter your API key securely"
                        value={agentApiKey}
                        onChange={(e) => setAgentApiKey(e.target.value)}
                      />
                      <p className="mt-2 text-sm text-gray-500 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Encrypted and stored securely with enterprise-grade
                        protection
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveSection("dashboard")}
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
                    <button
                      type="submit"
                      disabled={createAgentLoading}
                      className="inline-flex items-center px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {createAgentLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating Agent...
                        </>
                      ) : (
                        <>
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
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          Create Agent
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        );
      case "billing":
        return (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Billing & Plans
              </h2>
              <p className="text-lg text-gray-600">
                Choose the plan that fits your needs and start building AI
                agents.
              </p>
            </div>

            {/* Current Plan */}
            <div className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 mb-8">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Current Plan
                  </h3>
                </div>
              </div>
              <div className="px-6 py-8 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200/50">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-2">
                      Plan
                    </h4>
                    <p className="text-2xl font-bold text-indigo-900 capitalize">
                      {user?.plan}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200/50">
                    <h4 className="text-sm font-semibold text-green-700 mb-2">
                      Agent Limit
                    </h4>
                    <p className="text-2xl font-bold text-green-900">
                      {user?.agentLimit === -1 ? "Unlimited" : user?.agentLimit}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200/50">
                    <h4 className="text-sm font-semibold text-blue-700 mb-2">
                      Status
                    </h4>
                    <p className="text-2xl font-bold text-blue-900">Active</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => router.push("/dashboard/billing-history")}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>View Billing History</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  id: "regular",
                  name: "Regular",
                  price: 499,
                  currency: "INR",
                  interval: "month",
                  agents: 2,
                  features: ["2 AI Agents", "Basic Analytics", "Email Support"],
                },
                {
                  id: "special",
                  name: "Special",
                  price: 899,
                  currency: "INR",
                  interval: "month",
                  agents: 5,
                  features: [
                    "5 AI Agents",
                    "Advanced Analytics",
                    "Priority Support",
                  ],
                },
                {
                  id: "agency",
                  name: "Agency",
                  price: 0,
                  currency: "INR",
                  interval: "month",
                  agents: "Unlimited" as string | number,
                  features: [
                    "Unlimited AI Agents",
                    "Custom Analytics",
                    "Dedicated Support",
                  ],
                },
              ].map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white/70 backdrop-blur-md shadow-xl rounded-2xl border border-gray-200/50 overflow-hidden ${
                    user?.plan === plan.id ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {plan.name}
                      </h3>
                      {plan.price > 0 ? (
                        <p className="text-4xl font-bold text-white">
                          ₹{plan.price}
                          <span className="text-lg font-normal text-indigo-100">
                            /{plan.interval}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xl font-bold text-white">
                          Contact for pricing
                        </p>
                      )}
                      <p className="mt-2 text-indigo-100">
                        {plan.agents}{" "}
                        {typeof plan.agents === "number" ? "Agents" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {user?.plan === plan.id ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 px-4 py-3 rounded-xl cursor-not-allowed font-medium"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={subscribing}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {subscribing
                          ? "Processing..."
                          : plan.id === "agency"
                            ? "Contact Us"
                            : "Subscribe"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === "agency") {
      // Contact for pricing
      window.location.href =
        "mailto:support@nexavelosai.com?subject=Agency Plan Inquiry";
      return;
    }

    if (!user) return;

    setSubscribing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/payments/create-order",
        { plan: planId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const order = response.data.order;

      // Load Razorpay script if not loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => initiatePayment(order);
        document.body.appendChild(script);
      } else {
        initiatePayment(order);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create order");
    } finally {
      setSubscribing(false);
    }
  };

  const initiatePayment = (order: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_key", // Use env var
      amount: order.amount,
      currency: order.currency,
      name: "NexaVelosAI",
      description: `Payment for plan upgrade`,
      order_id: order.id,
      handler: async function (response: any) {
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            "http://localhost:5000/payments/verify-payment",
            {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          toast.success("Payment successful! Plan upgraded.");
          // Refresh user data
          window.location.reload();
        } catch (error: any) {
          toast.error("Payment verification failed");
        }
      },
      prefill: {
        email: user?.email,
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white/80 backdrop-blur-md shadow-xl border-r border-gray-200/50 ${
          sidebarOpen ? "block" : "hidden"
        } md:block w-64 h-screen fixed inset-y-0 left-0 z-50 overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h1 className="text-xl font-bold text-white">NexaVelosAI</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => {
                setActiveSection("dashboard");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeSection === "dashboard"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/60 hover:shadow-md backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                  />
                </svg>
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("create-agent");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeSection === "create-agent"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/60 hover:shadow-md backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create Agent</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("analytics");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeSection === "analytics"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/60 hover:shadow-md backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Analytics</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("billing");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeSection === "billing"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/60 hover:shadow-md backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span>Billing</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("documentation");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeSection === "documentation"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/60 hover:shadow-md backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Documentation</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("account");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeSection === "account"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/60 hover:shadow-md backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Account</span>
              </div>
            </button>
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Top Navigation */}
        <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 md:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-gray-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-white/60 transition-all duration-200"
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div className="hidden md:flex items-center space-x-8">
                  <button
                    onClick={() => setActiveSection("dashboard")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === "dashboard"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveSection("create-agent")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === "create-agent"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                    }`}
                  >
                    Create Agent
                  </button>
                  <button
                    onClick={() => setActiveSection("analytics")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === "analytics"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => setActiveSection("billing")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === "billing"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                    }`}
                  >
                    Billing
                  </button>
                  <button
                    onClick={() => setActiveSection("documentation")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === "documentation"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                    }`}
                  >
                    Documentation
                  </button>
                  <button
                    onClick={() => setActiveSection("account")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === "account"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                    }`}
                  >
                    Account
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium hidden sm:block">
                  Welcome, {user?.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium hidden md:block"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 overflow-y-auto md:ml-64">
          <div className="px-4 py-6 sm:px-0">{renderContent()}</div>
        </main>
      </div>

      {/* Test Agent Modal */}
      {testModalOpen && selectedAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200/50">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Test Agent
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      {selectedAgent.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTestModalOpen(false)}
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
            <div className="flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      Start a conversation
                    </p>
                    <p className="text-gray-400 text-sm">
                      Type a message below to test your agent
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-start space-x-3 max-w-[80%] ${
                            msg.role === "user"
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              msg.role === "user"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                                : "bg-gradient-to-r from-gray-400 to-gray-600"
                            }`}
                          >
                            {msg.role === "user" ? (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                              </svg>
                            )}
                          </div>
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-sm ${
                              msg.role === "user"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                : "bg-white border border-gray-200 text-gray-800"
                            }`}
                          >
                            {msg.role === "agent" ? (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm">{msg.content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-gray-500 text-sm">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 p-6 bg-white/50 backdrop-blur-sm">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                      disabled={chatLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatMessage.trim()}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {chatLoading ? (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <>
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
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editModalOpen && selectedAgentForEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Edit Agent
                  </h3>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
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
            <div className="p-6 space-y-6">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Agent Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                  placeholder="Enter agent name"
                />
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Describe your agent"
                />
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-1.657 0-3-1.343-3-3s1.343-3 3-3m0-3c1.657 0 3 1.343 3 3s-1.343 3-3 3"
                    />
                  </svg>
                  Domain (Optional)
                </label>
                <input
                  type="text"
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
                  placeholder="e.g., example.com"
                />
                <p className="mt-2 text-sm text-gray-500 flex items-center">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Restrict agent usage to specific domains
                </p>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditModalOpen(false)}
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
                <button
                  onClick={handleUpdateAgent}
                  className="inline-flex items-center px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
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
                  Update Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snippet Modal */}
      {snippetModalOpen && selectedAgentForSnippet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
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
                      Get Widget Snippet
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      {selectedAgentForSnippet.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSnippetModalOpen(false)}
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
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Snippet Version
                  </label>
                  <select
                    value={snippetVersion}
                    onChange={(e) => setSnippetVersion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  >
                    {user?.plan === "special" && (
                      <option value="full">Full (Inline Code)</option>
                    )}
                    <option value="short">Short (External Script)</option>
                  </select>
                </div>
                <p className="text-gray-600 text-sm">
                  Choose the type of widget snippet you want to copy:
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleCopySnippet("js")}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        JavaScript
                      </h4>
                      <p className="text-sm text-gray-600">
                        Embeddable script for any website
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleCopySnippet("react")}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        React/Next.js
                      </h4>
                      <p className="text-sm text-gray-600">
                        Component for React and Next.js applications
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
