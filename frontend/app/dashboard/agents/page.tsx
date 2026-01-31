"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/app/hooks/useAuth"; // Assuming this path is correct

interface Agent {
  _id: string;
  name: string;
  description?: string;
  provider: string;
  domain?: string;
  chatCount: number;
  totalInteractions: number;
}

export default function AgentsPage() {
  const { user, loading: authLoading } = useAuth(); // useAuth hook to get user and token
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) { // Wait for auth status to be resolved
      if (!user) {
        // If no user, redirect to login
        router.push("/login");
        return;
      }

      const fetchAgents = async () => {
        try {
          const token = localStorage.getItem("token"); // Get token directly from localStorage for API call
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/agents`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setAgents(response.data);
        } catch (error) {
          toast.error("Failed to load agents.");
          console.error("Error fetching agents:", error);
          // Optional: redirect to login if token is invalid/expired
          // localStorage.removeItem("token");
          // router.push("/login");
        } finally {
          setLoading(false);
        }
      };

      fetchAgents();
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          My AI Agents
        </h2>
        <button
          onClick={() => router.push("/dashboard/create-agent")}
          className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
        >
          Create New Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12 bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50">
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
            No AI agents created yet
          </p>
          <p className="text-gray-500 mb-6">
            Get started by creating your first AI agent.
          </p>
          <button
            onClick={() => router.push("/dashboard/create-agent")}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            Create Your First Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="bg-white/70 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {agent.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {agent.description || "No description provided."}
              </p>
              <div className="flex items-center text-sm text-gray-500">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>Chats: {agent.chatCount}</span>
                <span className="ml-4">
                  <svg
                    className="w-4 h-4 mr-1 inline-block"
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
                  Interactions: {agent.totalInteractions}
                </span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() =>
                    router.push(`/dashboard/agents/${agent._id}/edit`)
                  } // Placeholder for edit functionality
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
