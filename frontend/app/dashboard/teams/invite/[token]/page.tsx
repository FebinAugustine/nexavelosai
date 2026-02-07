"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/Alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

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
}

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const token = params.token as string;

  // Fetch invitation details
  const {
    data: invitation,
    isLoading,
    error,
  } = useQuery<Invitation>({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:5000/api/teams/invite/${token}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return res.data;
    },
    enabled: !!user,
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      return axios.post(
        `http://localhost:5000/api/teams/invite/${token}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
    },
    onSuccess: () => {
      toast.success("Invitation accepted successfully!");
      // Invalidate all relevant queries to ensure fresh data is fetched
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });

      setResponse({
        success: true,
        message: "Invitation accepted! You are now part of the team.",
      });

      setTimeout(() => {
        router.push("/dashboard/teams");
      }, 2000);
    },
    onError: (error: any) => {
      setResponse({
        success: false,
        message: error.response?.data?.message || "Failed to accept invitation",
      });
    },
  });

  // Reject invitation mutation
  const rejectInvitationMutation = useMutation({
    mutationFn: async () => {
      return axios.post(
        `http://localhost:5000/api/teams/invite/${token}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
    },
    onSuccess: () => {
      toast.success("Invitation rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });

      setResponse({
        success: true,
        message: "Invitation rejected.",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    },
    onError: (error: any) => {
      setResponse({
        success: false,
        message: error.response?.data?.message || "Failed to reject invitation",
      });
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleAccept = () => {
    acceptInvitationMutation.mutate();
  };

  const handleReject = () => {
    rejectInvitationMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to fetch invitation"}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (response) {
    return (
      <div className="max-w-md mx-auto">
        <Alert variant={response.success ? "default" : "destructive"}>
          <AlertTitle>{response.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{response.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Team Invitation</h1>
          <p className="text-gray-600">
            You have been invited to join a team on NexaVelosAI. Please review
            the invitation details below.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Invitation Details</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <p className="text-gray-900">{invitation?.teamId?.name}</p>
            </div>
            {invitation?.teamId?.description && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Description
                </label>
                <p className="text-gray-900">{invitation.teamId.description}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invited Email
              </label>
              <p className="text-gray-900">{invitation?.email}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <p className="text-gray-900">{invitation?.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invited By
              </label>
              <p className="text-gray-900">{invitation?.invitedBy?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleAccept} className="flex-1">
            Accept Invitation
          </Button>
          <Button onClick={handleReject} variant="ghost" className="flex-1">
            Reject Invitation
          </Button>
        </div>
      </Card>
    </div>
  );
}
