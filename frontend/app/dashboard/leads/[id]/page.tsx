"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface ChatSession {
  _id: string;
  status: string;
  createdAt: string;
  visitorId: string;
  ipAddress: string;
  userAgent: string;
}

export default function LeadDetail() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});

  // Fetch lead details
  const { data: lead, isLoading: leadLoading } = useQuery<Lead>({
    queryKey: ["lead", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  // Fetch chat sessions
  const { data: chatSessions, isLoading: sessionsLoading } = useQuery<
    ChatSession[]
  >({
    queryKey: ["lead-chat-sessions", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/leads/${id}/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    enabled: !!id,
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async (updateData: Partial<Lead>) => {
      const token = localStorage.getItem("token");
      return axios.patch(`http://localhost:5000/leads/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Lead updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update lead");
    },
  });

  useEffect(() => {
    if (lead) {
      setEditedLead(lead);
    }
  }, [lead]);

  const handleSave = () => {
    updateLeadMutation.mutate(editedLead);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedLead(lead || {});
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Lead deleted successfully");
        router.push("/dashboard/leads");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete lead");
      }
    }
  };

  if (leadLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Loading lead details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Lead" : "Lead Details"}
        </h1>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => router.push("/dashboard/leads")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLead.name || ""}
                    onChange={(e) =>
                      setEditedLead({ ...editedLead, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{lead?.name || "N/A"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedLead.email || ""}
                    onChange={(e) =>
                      setEditedLead({ ...editedLead, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{lead?.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLead.phone || ""}
                    onChange={(e) =>
                      setEditedLead({ ...editedLead, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{lead?.phone || "N/A"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLead.company || ""}
                    onChange={(e) =>
                      setEditedLead({ ...editedLead, company: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{lead?.company || "N/A"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editedLead.website || ""}
                    onChange={(e) =>
                      setEditedLead({ ...editedLead, website: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {lead?.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {lead.website}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={editedLead.status || "new"}
                    onChange={(e) =>
                      setEditedLead({
                        ...editedLead,
                        status: e.target.value as Lead["status"],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lead?.status === "new"
                        ? "bg-blue-100 text-blue-800"
                        : lead?.status === "contacted"
                          ? "bg-yellow-100 text-yellow-800"
                          : lead?.status === "qualified"
                            ? "bg-purple-100 text-purple-800"
                            : lead?.status === "converted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                    }`}
                  >
                    {lead?.status}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={editedLead.notes || ""}
                    onChange={(e) =>
                      setEditedLead({ ...editedLead, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{lead?.notes || "N/A"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sessions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chat Sessions
            </h2>
            {sessionsLoading ? (
              <div className="text-center py-4 text-gray-500">
                Loading chat sessions...
              </div>
            ) : chatSessions?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No chat sessions found
              </div>
            ) : (
              <div className="space-y-4">
                {chatSessions?.map((session) => (
                  <div key={session._id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
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
                    {session.visitorId && (
                      <div className="text-sm text-gray-600 mb-1">
                        Visitor: {session.visitorId}
                      </div>
                    )}
                    {session.ipAddress && (
                      <div className="text-sm text-gray-600 mb-1">
                        IP: {session.ipAddress}
                      </div>
                    )}
                    {session.userAgent && (
                      <div className="text-sm text-gray-600">
                        Browser: {session.userAgent}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
