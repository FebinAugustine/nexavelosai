"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/admin-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// TODO: When mutation functions (create, update, delete) are added,
// make sure to invalidate the 'adminAgents' query to refetch the data.
// Example: queryClient.invalidateQueries({ queryKey: ['adminAgents'] });

interface Agent {
  _id: string;
  name: string;
  description?: string;
  provider: string;
  domain?: string;
  chatCount: number;
  totalInteractions: number;
  userId: string;
  createdAt: string;
}

export default function AdminAgentsPage() {
  const queryClient = useQueryClient();
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const agentsPerPage = 12; // Max 12 agents per page

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAgents = async () => {
    const response = await adminApi.getAgents();
    return response.data;
  };

  const { data: agents, isLoading, error } = useQuery<Agent[]>({
    queryKey: ['adminAgents'],
    queryFn: fetchAgents,
  });

  // Filter agents based on search query
  const filteredAgents = agents?.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (agent.domain && agent.domain.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Reset currentPage to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate paginated agents from filteredAgents
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent);

  // Calculate total pages based on filteredAgents
  const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);

  // Previous and Next page handlers
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Agents</h1>
      </div>

      {/* Search Input Field */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search agents by name, provider, description, or domain..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentAgents.map((agent) => (
          <div key={agent._id} className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                {agent.name}
              </h3>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Provider</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{agent.provider}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Domain</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agent.domain || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Chats</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agent.chatCount}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Interactions</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agent.totalInteractions}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 truncate">{agent.userId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(agent.createdAt).toLocaleDateString()}</dd>
                </div>
                {agent.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{agent.description}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="mt-6 flex justify-center" aria-label="Pagination">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="mx-2">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
