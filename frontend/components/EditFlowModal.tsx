"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../app/hooks/useAuth";
import { Toast } from "./Toast";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface EditFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: string;
}

export function EditFlowModal({ isOpen, onClose, flowId }: EditFlowModalProps) {
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
      console.log("Fetching flow data for ID:", flowId);
      const response = await fetch(
        `http://localhost:5000/email/flows/${flowId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched flow data:", data);

        setFlowData(data);
      } else {
        const errorData = await response.text();
        console.error("Failed to fetch flow data:", errorData);
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
    if (isOpen && flowId) {
      fetchFlowData();
    }
  }, [isOpen, flowId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/email/flows/${flowId}`,
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
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
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

  const handleToggle = (field: "isActive" | "isPublished") => {
    setFlowData({
      ...flowData,
      [field]: !flowData[field],
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Flow">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {loading && !flowData.name ? (
        <div className="text-center py-8">Loading flow data...</div>
      ) : (
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
              Description
            </label>
            <textarea
              name="description"
              value={flowData.description}
              onChange={handleChange}
              placeholder="Enter flow description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={flowData.isActive}
              onChange={() => handleToggle("isActive")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Is Active
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={flowData.isPublished}
              onChange={() => handleToggle("isPublished")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700">
              Is Published
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
