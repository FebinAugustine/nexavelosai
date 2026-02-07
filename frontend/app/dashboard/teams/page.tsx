"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  ArrowLeft,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/Button";
import { CreateTeamModal } from "./CreateTeamModal";
import { TeamDetailsModal } from "./TeamDetailsModal";
import { useAuth } from "@/app/auth-provider";

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

interface Invitation {
  _id: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  createdAt: string;
  teamId: Team;
  invitedBy: any;
  expiresAt: string;
  token: string;
}

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
    [],
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
    fetchPendingInvitations();
  }, []);

  const fetchPendingInvitations = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/teams/invitations/pending",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending invitations");
      }

      const data = await response.json();
      setPendingInvitations(data);
    } catch (err) {
      console.error("Error fetching pending invitations:", err);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/teams", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const data = await response.json();
      setTeams(data);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (name: string, description?: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create team");
      }

      setIsCreateModalOpen(false);
      fetchTeams();
    } catch (err) {
      console.error("Error creating team:", err);
      setError(err instanceof Error ? err.message : "Failed to create team");
    }
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateTeam = async (id: string, data: Partial<Team>) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update team");
      }

      fetchTeams();
    } catch (err) {
      console.error("Error updating team:", err);
      setError(err instanceof Error ? err.message : "Failed to update team");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete team");
      }

      setIsDetailsModalOpen(false);
      fetchTeams();
    } catch (err) {
      console.error("Error deleting team:", err);
      setError(err instanceof Error ? err.message : "Failed to delete team");
    }
  };

  const handleShareAgent = async (teamId: string, agentId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${teamId}/share`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ agentId }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to share agent");
      }

      fetchTeams();
    } catch (err) {
      console.error("Error sharing agent:", err);
      setError(err instanceof Error ? err.message : "Failed to share agent");
    }
  };

  const handleUnshareAgent = async (teamId: string, agentId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${teamId}/share/${agentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unshare agent");
      }

      fetchTeams();
    } catch (err) {
      console.error("Error unsharing agent:", err);
      setError(err instanceof Error ? err.message : "Failed to unshare agent");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          </div>
          <p className="text-gray-600">
            Collaborate with your team on chatbot projects by creating teams and
            sharing agents.
          </p>
        </div>

        {/* Create Team Button */}
        <div className="mb-8">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Team
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
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

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingInvitations.map((invitation: Invitation) => (
                <div
                  key={invitation._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invitation.teamId?.name}
                    </h3>
                    <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </div>
                  {invitation.teamId?.description && (
                    <p className="text-gray-600 mb-4">
                      {invitation.teamId.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Role:</span>
                      <span className="capitalize">{invitation.role}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Invited by:</span>
                      <span>{invitation.invitedBy?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Expires:</span>
                      <span>
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        console.log(
                          "Accepting invitation with token:",
                          invitation.token,
                        );
                        try {
                          const response = await fetch(
                            `http://localhost:5000/api/teams/invite/${invitation.token}/accept`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                              },
                            },
                          );

                          console.log("Response status:", response.status);
                          const data = await response.json();
                          console.log("Response data:", data);

                          if (response.ok) {
                            // Refresh invitations list
                            fetchPendingInvitations();
                            // Refresh teams list
                            fetchTeams();
                          } else {
                            console.error(
                              "Error accepting invitation:",
                              data.message,
                            );
                            alert(`Error: ${data.message}`);
                          }
                        } catch (error) {
                          console.error("Error accepting invitation:", error);
                          alert("Error accepting invitation");
                        }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={async () => {
                        console.log(
                          "Rejecting invitation with token:",
                          invitation.token,
                        );
                        try {
                          const response = await fetch(
                            `http://localhost:5000/api/teams/invite/${invitation.token}/reject`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                              },
                            },
                          );

                          console.log("Response status:", response.status);
                          const data = await response.json();
                          console.log("Response data:", data);

                          if (response.ok) {
                            // Refresh invitations list
                            fetchPendingInvitations();
                          } else {
                            console.error(
                              "Error rejecting invitation:",
                              data.message,
                            );
                            alert(`Error: ${data.message}`);
                          }
                        } catch (error) {
                          console.error("Error rejecting invitation:", error);
                          alert("Error rejecting invitation");
                        }
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No teams yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first team to start collaborating with others.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Team
              </Button>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer"
                onClick={() => handleTeamClick(team)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {team.name}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                {team.description && (
                  <p className="text-gray-600 mb-4">{team.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {team.members.length} members
                  </span>
                  <span>{team.sharedAgents.length} shared agents</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modals */}
        <CreateTeamModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateTeam}
        />
        <TeamDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          team={selectedTeam}
          onUpdate={handleUpdateTeam}
          onDelete={handleDeleteTeam}
          onShareAgent={handleShareAgent}
          onUnshareAgent={handleUnshareAgent}
        />
      </div>
    </div>
  );
}
