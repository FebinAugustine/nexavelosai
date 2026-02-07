"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/Alert";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const token = params.token as string;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch invitation details from backend
    const fetchInvitation = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/teams/invite/${token}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch invitation");
        }

        const data = await res.json();
        setInvitation(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch invitation",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [user, router, token]);

  const handleAccept = async () => {
    try {
      console.log("Accepting invitation with token:", token);

      const res = await fetch(
        `http://localhost:5000/api/teams/invite/${token}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        setResponse({
          success: true,
          message: "Invitation accepted! You are now part of the team.",
        });

        setTimeout(() => {
          router.push("/dashboard/teams");
        }, 2000);
      } else {
        setResponse({
          success: false,
          message: data.message || "Failed to accept invitation",
        });
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setResponse({
        success: false,
        message: "Failed to accept invitation",
      });
    }
  };

  const handleReject = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/teams/invite/${token}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        setResponse({
          success: true,
          message: "Invitation rejected.",
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setResponse({
          success: false,
          message: data.message || "Failed to reject invitation",
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        message: "Failed to reject invitation",
      });
    }
  };

  if (loading) {
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
          <AlertDescription>{error}</AlertDescription>
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
