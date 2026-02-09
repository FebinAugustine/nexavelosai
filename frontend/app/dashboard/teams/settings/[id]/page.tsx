"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Shield,
  Users,
  Settings,
  Lock,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/Button";
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
  userRole?: string;
}

interface Role {
  role: string;
  permissions: string[];
  description: string;
}

interface TeamSettingsProps {
  params: { id: string };
}

export default function TeamSettings({ params }: TeamSettingsProps) {
  // Resolve params
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null,
  );

  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve params on mount
  useEffect(() => {
    const resolveParams = async () => {
      const result = await params;
      setResolvedParams(result);
    };
    resolveParams();
  }, [params]);

  const id = resolvedParams?.id;

  useEffect(() => {
    if (id && id !== "undefined" && id !== "null" && id.trim()) {
      fetchTeam();
      fetchRoles();
      fetchUserPermissions();
    } else if (resolvedParams !== null) {
      console.error("Invalid team id:", id);
      setError("Invalid team id");
      setLoading(false);
    }
  }, [id, resolvedParams]);

  const fetchTeam = async () => {
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid team id:", id);
      setError("Invalid team id");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch team");
      }

      const data = await response.json();
      setTeam(data);
    } catch (err) {
      console.error("Error fetching team:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch team");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/teams/roles", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data = await response.json();
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch roles");
    }
  };

  const fetchUserPermissions = async () => {
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid team id:", id);
      setError("Invalid team id");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${id}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user permissions");
      }

      const data = await response.json();
      setUserPermissions(data.permissions);
    } catch (err) {
      console.error("Error fetching user permissions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch user permissions",
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async (permission: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${id}/permissions/check?permission=${permission}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to check permission");
      }

      const data = await response.json();
      return data.hasPermission;
    } catch (err) {
      console.error("Error checking permission:", err);
      return false;
    }
  };

  const getPermissionIcon = (permission: string) => {
    if (permission.includes("manage")) return <Settings className="w-4 h-4" />;
    if (permission.includes("view")) return <Eye className="w-4 h-4" />;
    if (permission.includes("edit")) return <Edit3 className="w-4 h-4" />;
    if (permission.includes("delete")) return <Trash2 className="w-4 h-4" />;
    if (permission.includes("share")) return <Users className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getPermissionCategory = (permission: string): string => {
    if (permission.includes("team")) return "Team Management";
    if (permission.includes("agent")) return "Agent Management";
    if (permission.includes("lead")) return "Lead Management";
    if (permission.includes("billing")) return "Billing";
    if (permission.includes("analytics")) return "Analytics";
    return "General";
  };

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-indigo-100 text-indigo-800";
      case "editor":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Team Settings</h1>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error || "Team not found"}</p>
          </div>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900">
              {team.name} - Settings
            </h1>
          </div>
          <p className="text-gray-600">
            Manage team permissions, roles, and collaboration settings
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Permissions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Your Permissions
            </h2>
            <p className="text-gray-600 mb-4">
              You have the <strong>{team.userRole}</strong> role in this team.
            </p>
            <div className="space-y-2">
              {userPermissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    {getPermissionIcon(permission)}
                    <span className="ml-2 text-sm text-gray-700">
                      {permission.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {getPermissionCategory(permission)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Role Definitions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Role Definitions
            </h2>
            <div className="space-y-6">
              {roles.map((role) => (
                <div
                  key={role.role}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 capitalize">
                      {role.role}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(role.role)}`}
                    >
                      {role.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {role.description}
                  </p>
                  <div className="space-y-1">
                    {role.permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center text-sm text-gray-600"
                      >
                        {getPermissionIcon(permission)}
                        <span className="ml-2">
                          {permission.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Settings */}
        {team.userRole === "owner" || team.userRole === "admin" ? (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Team Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Team Information
                </h3>
                <p className="text-sm text-gray-600">
                  Manage basic team details and preferences.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Advanced Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Configure collaboration permissions and security settings.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
