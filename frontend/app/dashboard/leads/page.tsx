"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  tags: string[];
  notes: string;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "agent";
  content: string;
  timestamp?: string;
}

interface ChatSession {
  _id: string;
  status: string;
  createdAt: string;
  visitorId: string;
  ipAddress: string;
  userAgent: string;
  messages: ChatMessage[];
}

interface LeadStats {
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editLeadData, setEditLeadData] = useState<Partial<Lead>>({});
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Fetch leads
  const {
    data: leads,
    isLoading: leadsLoading,
    error: leadsError,
  } = useQuery<{
    data: Lead[];
    count: number;
    page: number;
    limit: number;
  }>({
    queryKey: ["leads", searchTerm, statusFilter, page, limit],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return null;
      }
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await axios.get(
        `http://localhost:5000/leads?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    enabled: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fetch leads stats
  const { data: stats, error: statsError } = useQuery<LeadStats>({
    queryKey: ["leads-stats"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/leads/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const token = localStorage.getItem("token");
      return axios.delete(`http://localhost:5000/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Lead deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-stats"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete lead");
    },
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }) => {
      const token = localStorage.getItem("token");
      return axios.patch(`http://localhost:5000/leads/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Lead updated successfully");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-stats"] });
      setEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update lead");
    },
  });

  // Export leads
  const exportLeads = async (format: "csv" | "json") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/leads/export",
        { format },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `leads.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Leads exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to export leads");
    }
  };

  const handleDelete = async (leadId: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteLeadMutation.mutate(leadId);
    }
  };

  const fetchChatSessions = async (leadId: string) => {
    try {
      setIsLoadingSessions(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/leads/${leadId}/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setChatSessions(response.data);
    } catch (error: any) {
      console.error("Error fetching chat sessions:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch chat sessions",
      );
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleView = async (lead: Lead) => {
    setSelectedLead(lead);
    await fetchChatSessions(lead._id);
    setViewModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setEditLeadData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      website: lead.website,
      status: lead.status,
      notes: lead.notes,
      tags: lead.tags,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    updateLeadMutation.mutate({
      id: selectedLead._id,
      data: editLeadData,
    });
  };

  // Error handling
  if (leadsError) {
    console.error("Error fetching leads:", leadsError);
    toast.error("Failed to fetch leads. Please check console for details.");
  }

  if (statsError) {
    console.error("Error fetching stats:", statsError);
    toast.error("Failed to fetch stats. Please check console for details.");
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="flex gap-3">
          <button
            onClick={() => exportLeads("csv")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportLeads("json")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats && (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">N</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">New</div>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.new}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">C</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contacted</div>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.contacted}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">Q</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Qualified</div>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.qualified}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">C</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Converted</div>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.converted}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold">L</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Lost</div>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.lost}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
        <div className="min-w-[150px]">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leadsLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading leads...
                  </td>
                </tr>
              ) : leads?.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No leads found
                  </td>
                </tr>
              ) : (
                leads?.data.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.company || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lead.status === "new"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "contacted"
                              ? "bg-yellow-100 text-yellow-800"
                              : lead.status === "qualified"
                                ? "bg-purple-100 text-purple-800"
                                : lead.status === "converted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleView(lead)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {leads && leads.count > limit && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{leads.data.length}</span>{" "}
                of <span className="font-medium">{leads.count}</span> leads
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm leading-4 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={leads.data.length < limit}
                  className="px-3 py-1 border border-gray-300 rounded text-sm leading-4 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      {editModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200/50">
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
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Edit Lead
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      {selectedLead.name}
                    </p>
                  </div>
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
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editLeadData.name || ""}
                    onChange={(e) =>
                      setEditLeadData({ ...editLeadData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editLeadData.email || ""}
                    onChange={(e) =>
                      setEditLeadData({
                        ...editLeadData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editLeadData.phone || ""}
                    onChange={(e) =>
                      setEditLeadData({
                        ...editLeadData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editLeadData.company || ""}
                    onChange={(e) =>
                      setEditLeadData({
                        ...editLeadData,
                        company: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={editLeadData.website || ""}
                    onChange={(e) =>
                      setEditLeadData({
                        ...editLeadData,
                        website: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editLeadData.status || "new"}
                    onChange={(e) =>
                      setEditLeadData({
                        ...editLeadData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editLeadData.notes || ""}
                  onChange={(e) =>
                    setEditLeadData({ ...editLeadData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLeadMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLeadMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {viewModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200/50">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Lead Details
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      {selectedLead.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewModalOpen(false)}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Lead Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Lead Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <p className="text-gray-900">
                        {selectedLead.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{selectedLead.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {selectedLead.phone || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <p className="text-gray-900">
                        {selectedLead.company || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <p className="text-gray-900">
                        {selectedLead.website ? (
                          <a
                            href={selectedLead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedLead.website}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedLead.status === "new"
                            ? "bg-blue-100 text-blue-800"
                            : selectedLead.status === "contacted"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedLead.status === "qualified"
                                ? "bg-purple-100 text-purple-800"
                                : selectedLead.status === "converted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedLead.status}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <p className="text-gray-900">
                        {selectedLead.notes || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created At
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedLead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Sessions */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Chat Sessions
                  </h2>

                  {isLoadingSessions ? (
                    <div className="text-center py-4 text-gray-500">
                      Loading chat sessions...
                    </div>
                  ) : chatSessions?.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No chat sessions found
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {chatSessions?.map((session) => (
                        <div
                          key={session._id}
                          className="border border-gray-200 rounded-xl p-4 bg-white/50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                session.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {session.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Chat Conversation */}
                          {session.messages && session.messages.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Conversation:
                              </h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {session.messages.map((message, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex ${
                                      message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    <div
                                      className={`max-w-[80%] p-3 rounded-lg ${
                                        message.role === "user"
                                          ? "bg-blue-600 text-white rounded-tr-none"
                                          : "bg-gray-100 text-gray-900 rounded-tl-none"
                                      }`}
                                    >
                                      <div className="text-sm">
                                        {message.content}
                                      </div>
                                      {message.timestamp && (
                                        <div
                                          className={`text-xs mt-1 ${
                                            message.role === "user"
                                              ? "text-blue-100"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {new Date(
                                            message.timestamp,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Session Details */}
                          <div className="space-y-1 text-xs text-gray-600">
                            {session.visitorId && (
                              <div>Visitor: {session.visitorId}</div>
                            )}
                            {session.ipAddress && (
                              <div>IP: {session.ipAddress}</div>
                            )}
                            {session.userAgent && (
                              <div>Browser: {session.userAgent}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
