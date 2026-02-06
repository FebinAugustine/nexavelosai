"use client";

import { useState, useEffect } from "react";
import { X, Users, Plus, Share, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/Button";

interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  sharedAgents: string[];
  createdAt: string;
  updatedAt: string;
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

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description || "");
      fetchAgents();
    }
  }, [team]);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents", {
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

      const response = await fetch(`/api/teams/${team._id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to invite member");
      }

      setIsInvitingMember(false);
      setInviteEmail("");
      setInviteRole("viewer");
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

  if (!isOpen || !team) return null;

  const isOwner = true; // TODO: Check if current user is owner
  const unsharedAgents = agents.filter(
    (agent) => !team.sharedAgents.includes(agent._id),
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Team Details</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            {/* Members list goes here */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Member management coming soon...
              </p>
            </div>
          </section>

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
                  onClick={() => {
                    /* Open share agent modal */
                  }}
                  className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Agent
                </Button>
              )}
            </div>
            {/* Shared agents list goes here */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Shared agents management coming soon...
              </p>
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
                  Deleting this team will remove all members and shared agents.
                  This action cannot be undone.
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
  );
}
