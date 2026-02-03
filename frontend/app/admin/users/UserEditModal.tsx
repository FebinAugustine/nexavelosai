import React from "react";

// Define the User and FormState interfaces within this file
export interface User {
  _id: string;
  email: string;
  role: string;
  plan: string;
  agentLimit: number;
  isVerified: boolean;
  createdAt: string;
  domains: string[];
}

export interface FormState {
  email: string;
  password?: string;
  role: string;
  plan: string;
  agentLimit: number;
  isVerified?: boolean;
  domains: string[];
}

interface UserEditModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formState: FormState;
  onClose: () => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  isEditMode,
  formState,
  onClose,
  onChange,
  onSubmit,
}) => {
  console.log(
    "UserEditModal rendering, isOpen:",
    isOpen,
    "isEditMode:",
    isEditMode,
  );
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75">
      {/* Modal Dialog container, re-using simplified centering from minimal version */}
      <div className="relative z-[101] bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        {" "}
        {/* Added w-full max-w-lg for sizing */}
        <form onSubmit={onSubmit}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3
              className="text-lg leading-6 font-medium text-gray-900"
              id="modal-title"
            >
              {isEditMode ? "Edit User" : "Add New User"}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formState.email}
                  onChange={onChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  disabled={isEditMode}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password {isEditMode && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formState.password || ""}
                  onChange={onChange}
                  required={!isEditMode}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={formState.role}
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="plan"
                  className="block text-sm font-medium text-gray-700"
                >
                  Plan
                </label>
                <select
                  name="plan"
                  id="plan"
                  value={formState.plan}
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="free">Free</option>
                  <option value="regular">Regular</option>
                  <option value="special">Special</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="agentLimit"
                  className="block text-sm font-medium text-gray-700"
                >
                  Agent Limit (-1 for unlimited)
                </label>
                <input
                  type="number"
                  name="agentLimit"
                  id="agentLimit"
                  value={formState.agentLimit}
                  onChange={onChange}
                  required
                  min="-1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label
                  htmlFor="domains"
                  className="block text-sm font-medium text-gray-700"
                >
                  Domains (comma separated)
                </label>
                <input
                  type="text"
                  name="domains"
                  id="domains"
                  value={formState.domains.join(", ")}
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="domain1.com, domain2.net"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="isVerified"
                  name="isVerified"
                  type="checkbox"
                  checked={formState.isVerified}
                  onChange={onChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isVerified"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Is Verified
                </label>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isEditMode ? "Save Changes" : "Create User"}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
