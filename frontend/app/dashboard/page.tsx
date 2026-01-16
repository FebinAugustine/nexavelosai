"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useSocket } from "../socket-context";

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
        }
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
        }
      );
      toast.success("Agent updated successfully!");
      setAgents(
        agents.map((agent) =>
          agent._id === selectedAgentForEdit._id ? response.data : agent
        )
      );
      setEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update agent");
    }
  };

  const handleGetSnippet = async (agentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/agents/${agentId}/snippet`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const snippet = response.data.snippet;
      // Copy to clipboard or show in alert
      navigator.clipboard
        .writeText(snippet)
        .then(() => {
          toast.success("Snippet copied to clipboard!");
        })
        .catch(() => {
          alert(`Copy this code to your website:\n\n${snippet}`);
        });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to get snippet");
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

            {/* User Info */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Account Information
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.email}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Plan</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {user?.plan}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Agent Limit
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.agentLimit}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Domains
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.domains.length ? user.domains.join(", ") : "None"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Agents Overview */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    AI Agents ({agents.length})
                  </h3>
                  <button
                    onClick={() => router.push("/dashboard/create-agent")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Create Agent
                  </button>
                </div>
                {agents.length === 0 ? (
                  <p className="text-gray-600">
                    You have no AI agents created. Create your first agent to
                    get started.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">
                              {agent.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {agent.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              Provider: {agent.provider}
                            </p>
                            <p className="text-sm text-gray-500">
                              Domain: {agent.domain || "Not set"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Chats: {agent.chatCount} | Interactions:{" "}
                              {agent.totalInteractions}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleTestAgent(agent)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Test Agent
                            </button>
                            <button
                              onClick={() => handleGetSnippet(agent._id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Get Snippet
                            </button>
                            <button
                              onClick={() => handleEditAgent(agent)}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agent._id)}
                              className="text-red-600 hover:text-red-800"
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
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Analytics
              </h3>
              {analytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-indigo-600">
                        Total Agents
                      </h4>
                      <p className="text-2xl font-bold text-indigo-900">
                        {analytics.totalAgents}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-600">
                        Total Chats
                      </h4>
                      <p className="text-2xl font-bold text-green-900">
                        {analytics.totalChats}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-600">
                        Total Interactions
                      </h4>
                      <p className="text-2xl font-bold text-blue-900">
                        {analytics.totalInteractions}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Agent Performance
                    </h4>
                    <div className="space-y-2">
                      {analytics.agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">{agent.name}</span>
                          <div className="text-sm text-gray-600">
                            Chats: {agent.chatCount} | Interactions:{" "}
                            {agent.totalInteractions}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Loading analytics...</p>
              )}
            </div>
          </div>
        );
      case "account":
        return (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Account Settings
              </h3>
              <p className="text-gray-600">
                Account settings and preferences will be available here.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg ${
          sidebarOpen ? "block" : "hidden"
        } md:block w-64 min-h-screen fixed md:static inset-y-0 left-0 z-50`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-indigo-600">
            <h1 className="text-xl font-bold text-white">NexaVelosAI</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => {
                setActiveSection("dashboard");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeSection === "dashboard"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/dashboard/create-agent")}
              className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Create Agent
            </button>
            <button
              onClick={() => {
                setActiveSection("analytics");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeSection === "analytics"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => router.push("/dashboard/billing")}
              className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Billing
            </button>
            <button
              onClick={() => {
                setActiveSection("account");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeSection === "account"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Account
            </button>
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm md:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-700 hover:text-indigo-600"
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
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.email}</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
    </div>
  );
}
