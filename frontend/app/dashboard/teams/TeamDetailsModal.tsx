"use client";

import { useState, useEffect } from "react";
import { X, Users, Plus, Share, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/Button";
import { useAuth } from "@/app/auth-provider";
import { Toast } from "@/components/Toast";

interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  sharedAgents: string[];
  createdAt: string;
  updatedAt: string;
  userRole?: string;
}

interface Agent {
  _id: string;
  name: string;
  description?: string;
}

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onUpdate: (id: string, data: Partial<Team>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onShareAgent: (teamId: string, agentId: string) => Promise<void>;
  onUnshareAgent: (teamId: string, agentId: string) => Promise<void>;
}

export function TeamDetailsModal({
  isOpen,
  onClose,
  team,
  onUpdate,
  onDelete,
  onShareAgent,
  onUnshareAgent,
}: TeamDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [isSharingAgent, setIsSharingAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamInvitations, setTeamInvitations] = useState<any[]>([]);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description || "");
      fetchAgents();
      fetchTeamMembers();
      // Only fetch invitations if user has owner or admin role
      if (team.userRole === "owner" || team.userRole === "admin") {
        fetchTeamInvitations();
      }
    }
  }, [team]);

  const fetchTeamInvitations = async () => {
    if (!team) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id}/invitations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team invitations");
      }

      const data = await response.json();
      setTeamInvitations(data);
    } catch (err) {
      console.error("Error fetching team invitations:", err);
      setError("Failed to load team invitations");
    }
  };

  const fetchTeamMembers = async () => {
    if (!team) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id}/members`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      setTeamMembers(data);
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError("Failed to load team members");
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch("http://localhost:5000/agents", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }

      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("Failed to load agents");
    }
  };

  const handleSave = async () => {
    if (!team) return;

    try {
      setLoading(true);
      setError(null);
      await onUpdate(team._id, { name, description });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!team) return;

    if (
      confirm(
        "Are you sure you want to delete this team? This action cannot be undone.",
      )
    ) {
      try {
        setLoading(true);
        setError(null);
        await onDelete(team._id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete team");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to invite member");
      }

      setIsInvitingMember(false);
      setInviteEmail("");
      setInviteRole("viewer");
      setToast({
        message: "Invitation sent successfully!",
        type: "success",
      });
      fetchTeamInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  const handleShareAgent = async (agentId: string) => {
    if (!team) return;

    try {
      setLoading(true);
      setError(null);
      await onShareAgent(team._id, agentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share agent");
    } finally {
      setLoading(false);
    }
  };

  const handleShareAgentClick = () => {
    setIsSharingAgent(true);
    setSelectedAgentId(null);
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!team) return;

    console.log("handleUpdateMemberRole called with:");
    console.log("  memberId:", memberId);
    console.log("  newRole:", newRole);
    console.log("  teamId:", team._id);

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id}/members/${memberId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update member role");
      }

      fetchTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;

    if (
      !confirm("Are you sure you want to remove this member from the team?")
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove member");
      }

      fetchTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleShareAgentConfirm = async () => {
    if (!team || !selectedAgentId) return;

    try {
      setLoading(true);
      setError(null);
      await onShareAgent(team._id, selectedAgentId);
      setIsSharingAgent(false);
      setSelectedAgentId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share agent");
    } finally {
      setLoading(false);
    }
  };

  const handleUnshareAgent = async (agentId: string) => {
    if (!team) return;

    try {
      setLoading(true);
      setError(null);
      await onUnshareAgent(team._id, agentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unshare agent");
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/teams/invitations/${invitationId}/resend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend invitation");
      }

      fetchTeamInvitations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend invitation",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/teams/invitations/${invitationId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel invitation");
      }

      fetchTeamInvitations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel invitation",
      );
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();

  if (!isOpen || !team) return null;

  const isOwner = user?._id === team.ownerId;
  const unsharedAgents = agents.filter(
    (agent) => !team.sharedAgents.includes(agent._id),
  );

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Team Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Team Information */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Team Information
              </h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="teamName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Team Name
                    </label>
                    <input
                      type="text"
                      id="teamName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="teamDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Team Description
                    </label>
                    <textarea
                      id="teamDescription"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setName(team.name);
                        setDescription(team.description || "");
                      }}
                      disabled={loading}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={loading || !name.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Team Name
                    </h4>
                    <p className="text-lg text-gray-900">{team.name}</p>
                  </div>
                  {team.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Team Description
                      </h4>
                      <p className="text-gray-700">{team.description}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Created: {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Updated: {new Date(team.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {isOwner && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                    >
                      Edit Team Info
                    </Button>
                  )}
                </div>
              )}
            </section>

            {/* Team Members */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Team Members ({team.members.length})
                </h3>
                {isOwner && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInvitingMember(true)}
                    className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-gray-500">No members yet</p>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.userId?._id || member.userId}
                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {member.userId?.email?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.userId?.email || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        {isOwner && member.role !== "owner" && (
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  handleUpdateMemberRole(
                                    member.userId?._id || member.userId,
                                    e.target.value,
                                  )
                                }
                                disabled={loading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                              >
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                              </select>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveMember(
                                  member.userId?._id || member.userId,
                                )
                              }
                              disabled={loading}
                              className="text-gray-500 hover:text-red-600"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Team Invitations - only visible to owner or admin */}
            {(team.userRole === "owner" || team.userRole === "admin") && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pending Invitations (
                    {
                      teamInvitations.filter((inv) => inv.status === "pending")
                        .length
                    }
                    )
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  {teamInvitations.filter((inv) => inv.status === "pending")
                    .length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No pending invitations
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {teamInvitations
                        .filter((inv) => inv.status === "pending")
                        .map((invitation) => (
                          <div
                            key={invitation._id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                <span className="text-yellow-600 font-medium text-sm">
                                  {invitation.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {invitation.email}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {invitation.role}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Expires:{" "}
                                  {new Date(
                                    invitation.expiresAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {isOwner && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleResendInvitation(invitation._id)
                                  }
                                  disabled={loading}
                                  className="text-gray-500 hover:text-green-600"
                                >
                                  Resend
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelInvitation(invitation._id)
                                  }
                                  disabled={loading}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Shared Agents */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Shared Agents ({team.sharedAgents.length})
                </h3>
                {isOwner && unsharedAgents.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleShareAgentClick}
                    className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Agent
                  </Button>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                {team.sharedAgents.length === 0 ? (
                  <p className="text-sm text-gray-500">No agents shared yet</p>
                ) : (
                  <div className="space-y-3">
                    {agents
                      .filter((agent) => team.sharedAgents.includes(agent._id))
                      .map((agent) => (
                        <div
                          key={agent._id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-medium text-sm">
                                {agent.name?.charAt(0)?.toUpperCase() || "A"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {agent.name}
                              </p>
                              {agent.description && (
                                <p className="text-xs text-gray-500">
                                  {agent.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {isOwner && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnshareAgent(agent._id)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              Unshare
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>

            {/* Danger Zone */}
            {isOwner && (
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Danger Zone
                </h3>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-700 mb-4">
                    Deleting this team will remove all members and shared
                    agents. This action cannot be undone.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? "Deleting..." : "Delete Team"}
                  </Button>
                </div>
              </section>
            )}
          </div>

          {/* Share Agent Modal */}
          {isSharingAgent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Share Agent
                  </h2>
                  <button
                    onClick={() => setIsSharingAgent(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    Select an agent to share with this team:
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unsharedAgents.map((agent) => (
                      <div
                        key={agent._id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedAgentId === agent._id
                            ? "bg-indigo-100 border border-indigo-500"
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedAgentId(agent._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {agent.name}
                            </p>
                            {agent.description && (
                              <p className="text-xs text-gray-500">
                                {agent.description}
                              </p>
                            )}
                          </div>
                          {selectedAgentId === agent._id && (
                            <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
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
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSharingAgent(false)}
                      disabled={loading}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleShareAgentConfirm}
                      disabled={loading || !selectedAgentId}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Sharing..." : "Share Agent"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invite Member Modal */}
          {isInvitingMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Invite Member
                  </h2>
                  <button
                    onClick={() => setIsInvitingMember(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleInviteMember} className="p-6 space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      disabled={loading}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsInvitingMember(false)}
                      disabled={loading}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !inviteEmail}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Inviting..." : "Send Invitation"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
