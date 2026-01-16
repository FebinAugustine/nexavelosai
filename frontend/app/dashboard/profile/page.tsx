"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  email: string;
  plan: string;
  agentLimit: number;
  domains: string[];
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: "",
    plan: "",
    agentLimit: 0,
    domains: [""],
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setEditData({
          email: response.data.email,
          plan: response.data.plan,
          agentLimit: response.data.agentLimit,
          domains:
            response.data.domains.length > 0 ? response.data.domains : [""],
        });
      } catch (error) {
        toast.error("Failed to load profile");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        "http://localhost:5000/auth/profile",
        editData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const addDomain = () => {
    setEditData((prev) => ({ ...prev, domains: [...prev.domains, ""] }));
  };

  const updateDomain = (index: number, value: string) => {
    setEditData((prev) => ({
      ...prev,
      domains: prev.domains.map((d, i) => (i === index ? value : d)),
    }));
  };

  const removeDomain = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      domains: prev.domains.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">
                NexaVelosAI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-700 hover:text-indigo-600"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Profile</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plan
                    </label>
                    <select
                      value={editData.plan}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          plan: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    >
                      <option value="regular">Regular</option>
                      <option value="special">Special</option>
                      <option value="agency">Agency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Agent Limit
                    </label>
                    <input
                      type="number"
                      value={editData.agentLimit}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          agentLimit: parseInt(e.target.value),
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Domains
                    </label>
                    {editData.domains.map((domain, index) => (
                      <div key={index} className="flex mt-1">
                        <input
                          type="text"
                          value={domain}
                          onChange={(e) => updateDomain(index, e.target.value)}
                          placeholder="e.g., example.com"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        />
                        <button
                          onClick={() => removeDomain(index)}
                          className="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 rounded-r-md text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addDomain}
                      className="mt-2 text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Domain
                    </button>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.email}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Plan</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {user?.plan}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Agent Limit
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.agentLimit}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Domains
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.domains.length ? user.domains.join(", ") : "None"}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
