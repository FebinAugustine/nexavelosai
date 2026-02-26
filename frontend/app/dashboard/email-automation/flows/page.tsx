"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { Toast } from "../../../../components/Toast";
import { Button } from "../../../../components/Button";
import { Card } from "../../../../components/Card";
import { CreateFlowModal } from "../../../../components/CreateFlowModal";
import { EditFlowModal } from "../../../../components/EditFlowModal";

// Define flow types based on backend schema
type FlowNodeType = "trigger" | "action" | "condition" | "delay" | "end";
type TriggerType = "new_lead" | "email_response" | "lead_status_change";
type ActionType =
  | "send_email"
  | "update_lead_status"
  | "add_tag"
  | "create_task"
  | "webhook";
type DelayUnit = "seconds" | "minutes" | "hours" | "days";
type ConditionType =
  | "lead_status"
  | "email_response_content"
  | "time_elapsed"
  | "tag_exists";

interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  data: any;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  data: any;
}

interface EmailFlow {
  _id: string;
  name: string;
  description?: string;
  flowData: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  };
  aiApiSource: string;
  customApiKey?: string;
  customApiProvider?: string;
  isActive: boolean;
  isPublished: boolean;
  stats?: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    avgProcessingTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EmailFlowsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [flows, setFlows] = useState<EmailFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState<string>("");

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/email/flows", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlows(data);
      } else {
        throw new Error("Failed to fetch flows");
      }
    } catch (error) {
      console.error("Error fetching flows:", error);
      setToast({ message: "Failed to load flows", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditFlow = (flowId: string) => {
    setSelectedFlowId(flowId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedFlowId("");
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!confirm("Are you sure you want to delete this flow?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/email/flows/${flowId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        setFlows(flows.filter((flow) => flow._id !== flowId));
        setToast({ message: "Flow deleted successfully", type: "success" });
      } else {
        throw new Error("Failed to delete flow");
      }
    } catch (error) {
      console.error("Error deleting flow:", error);
      setToast({ message: "Failed to delete flow", type: "error" });
    }
  };

  const handlePublishFlow = async (flowId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/email/flows/${flowId}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const updatedFlow = await response.json();
        setFlows(
          flows.map((flow) => (flow._id === flowId ? updatedFlow : flow)),
        );
        setToast({ message: "Flow published successfully", type: "success" });
      } else {
        throw new Error("Failed to publish flow");
      }
    } catch (error) {
      console.error("Error publishing flow:", error);
      setToast({ message: "Failed to publish flow", type: "error" });
    }
  };

  const handleRunFlow = async (flowId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/email/flows/${flowId}/run`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (response.ok) {
        setToast({ message: "Flow started successfully", type: "success" });
      } else {
        throw new Error("Failed to run flow");
      }
    } catch (error) {
      console.error("Error running flow:", error);
      setToast({ message: "Failed to run flow", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <CreateFlowModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
      <EditFlowModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        flowId={selectedFlowId}
      />
      <div className="p-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Flow Builder</h1>
            <Button
              onClick={handleCreateFlow}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New Flow
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Design automated email workflows for your leads
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <Card key={flow._id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {flow.name}
                  </h3>
                  {flow.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {flow.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/dashboard/email-automation/flows/${flow._id}/edit`,
                      )
                    }
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDeleteFlow(flow._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-900"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      flow.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {flow.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Active:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      flow.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {flow.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {flow.stats && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Total Runs:</span>
                      <span className="text-gray-900">
                        {flow.stats.totalRuns}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="text-gray-900">
                        {flow.stats.totalRuns > 0
                          ? `${Math.round((flow.stats.successfulRuns / flow.stats.totalRuns) * 100)}%`
                          : "0%"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        Avg Processing Time:
                      </span>
                      <span className="text-gray-900">
                        {flow.stats.avgProcessingTime}ms
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                {!flow.isPublished && (
                  <Button
                    onClick={() => handlePublishFlow(flow._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Publish
                  </Button>
                )}

                <Button
                  onClick={() => handleRunFlow(flow._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Run
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {flows.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No flows created yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Create your first email automation flow to get started
            </p>
            <div className="mt-6">
              <Button
                onClick={handleCreateFlow}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create First Flow
              </Button>
            </div>
          </div>
        )}
      </div>
      <CreateFlowModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </>
  );
}
