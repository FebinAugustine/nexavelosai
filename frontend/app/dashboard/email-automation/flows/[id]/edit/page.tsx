"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../hooks/useAuth";
import { Toast } from "../../../../../../components/Toast";
import { Button } from "../../../../../../components/Button";
import { Card } from "../../../../../../components/Card";

export default function EditFlowPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [flowData, setFlowData] = useState({
    name: "",
    description: "",
    flowData: { nodes: [], edges: [] },
    aiApiSource: "openai",
    customApiKey: "",
    customApiProvider: "",
    isActive: false,
    isPublished: false,
  });

  const fetchFlowData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/email/flows/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setFlowData(data);
      } else {
        throw new Error("Failed to fetch flow data");
      }
    } catch (error) {
      console.error("Error fetching flow data:", error);
      setToast({ message: "Failed to load flow data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchFlowData();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/email/flows/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(flowData),
        },
      );

      if (response.ok) {
        setToast({ message: "Flow updated successfully", type: "success" });
      } else {
        throw new Error("Failed to update flow");
      }
    } catch (error) {
      console.error("Error updating flow:", error);
      setToast({ message: "Failed to update flow", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFlowData({
      ...flowData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Flow</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flow Name
              </label>
              <input
                type="text"
                name="name"
                value={flowData.name}
                onChange={handleChange}
                placeholder="Enter flow name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={flowData.description}
                onChange={handleChange}
                placeholder="Enter flow description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Flow"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/email-automation/flows")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
