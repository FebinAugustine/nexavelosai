"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/admin-api";
import { useRouter } from "next/navigation";
import UserEditModal, { User, FormState } from "./UserEditModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react"; // Keep useEffect for searchQuery reset

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    role: "user",
    plan: "free",
    agentLimit: 1,
    isVerified: false,
    domains: [] as string[],
  });
  const router = useRouter();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 12;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    const response = await adminApi.getUsers();
    return response.data;
  };

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["adminUsers"],
    queryFn: fetchUsers,
  });

  // Filter users based on search query
  const filteredUsers =
    users?.filter(
      (user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.plan.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  // Reset currentPage to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate paginated users from filteredUsers
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Calculate total pages based on filteredUsers
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Previous and Next page handlers
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentUser(null);
    setFormState({
      email: "",
      password: "",
      role: "user",
      plan: "free",
      agentLimit: 1,
      isVerified: false,
      domains: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    console.log("Opening edit modal for user:", user);
    console.log("User domains received:", user.domains);
    setIsEditMode(true);
    setCurrentUser(user);
    setFormState({
      email: user.email,
      password: "",
      role: user.role,
      plan: user.plan,
      agentLimit: user.agentLimit,
      isVerified: user.isVerified,
      domains: user.domains || [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormState((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "agentLimit") {
      setFormState((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
    } else if (name === "domains") {
      setFormState((prev) => ({
        ...prev,
        domains: value
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d.length > 0),
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && currentUser) {
        const userDataToUpdate: Partial<User> & { password?: string } = {
          email: formState.email,
          role: formState.role,
          plan: formState.plan,
          agentLimit: formState.agentLimit,
          domains: formState.domains,
        };
        if (formState.password) {
          userDataToUpdate.password = formState.password;
        }

        await adminApi.updateUser(currentUser._id as string, userDataToUpdate);
        toast.success("User updated successfully!");
      } else {
        const userDataToCreate = { ...formState };
        delete userDataToCreate.isVerified;

        await adminApi.createUser(userDataToCreate);
        toast.success("User created successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); // Invalidate query to refetch data
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        await adminApi.deleteUser(id);
        toast.success("User deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); // Invalidate query to refetch data
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add New User
        </button>
      </div>

      {/* Search Input Field */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by email, role, or plan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentUsers.map(
          (
            user, // <--- Changed from 'users' to 'currentUsers'
          ) => (
            <div
              key={user._id}
              className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                  {user.email}
                </h3>
                {user.isVerified ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Unverified
                  </span>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {user.role}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Plan</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {user.plan}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Agent Limit
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.agentLimit === -1 ? "Unlimited" : user.agentLimit}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  onClick={() => openEditModal(user)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="mt-6 flex justify-center" aria-label="Pagination">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="mx-2">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      )}

      <UserEditModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formState={formState}
        onClose={closeModal}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
