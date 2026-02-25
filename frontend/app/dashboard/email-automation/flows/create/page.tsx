"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../hooks/useAuth";
import { Toast } from "../../../../../components/Toast";
import { Button } from "../../../../../components/Button";
import { Card } from "../../../../../components/Card";

export default function CreateFlowPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/email/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          flowData: { nodes: [], edges: [] },
          aiApiSource: "openai",
          isActive: false,
          isPublished: false,
        }),
      });

      if (response.ok) {
        const flow = await response.json();
        setToast({ message: "Flow created successfully", type: "success" });
        setTimeout(() => {
          router.push(`/dashboard/email-automation/flows/${flow._id}/edit`);
        }, 1000);
      } else {
        throw new Error("Failed to create flow");
      }
    } catch (error) {
      console.error("Error creating flow:", error);
      setToast({ message: "Failed to create flow", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
          <h1 className="text-2xl font-bold mb-6">Create New Flow</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flow Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
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
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter flow description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Flow"}
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
