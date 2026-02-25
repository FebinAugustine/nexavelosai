"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface ContactList {
  _id: string;
  fileName: string;
  contactCount: number;
  createdAt: string;
  columns: string[];
}

export default function ContactsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewFileName, setPreviewFileName] = useState("");
  const queryClient = useQueryClient();

  // Fetch contact lists
  const { data: contactLists = [], isLoading } = useQuery({
    queryKey: ["contact-lists"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/contacts/lists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
  });

  // Delete contact list mutation
  const deleteContactList = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/contacts/lists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
    },
    onError: (error: any) => {
      console.error("Error deleting contact list:", error);
      alert("Failed to delete contact list. Please try again.");
    },
  });

  // Upload contact list mutation
  const uploadContactList = useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:5000/contacts/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
      setSelectedFile(null);
      setIsUploading(false);
    },
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      uploadContactList.mutate(selectedFile);
    }
  };

  // Handle preview contact list
  const handlePreview = async (id: string, fileName: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/contacts/lists/${id}/preview`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPreviewData(response.data.data);
      setPreviewFileName(fileName);
      setPreviewModalOpen(true);
    } catch (error) {
      console.error("Error previewing contact list:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Contact Lists</h1>
          <p className="text-gray-600">
            Upload Excel or CSV files with your email and WhatsApp contacts
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-700">
          Drag & drop your file here
        </h3>
        <p className="text-gray-500 mb-1">or click to browse</p>
        <p className="text-sm text-gray-500">
          Supports Excel (.xlsx, .xls) and CSV files
          <br />
          File should contain 'email' or 'phone' column
        </p>

        <input
          type="file"
          id="file-upload"
          className="sr-only"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
        />
        <label
          htmlFor="file-upload"
          className="mt-6 inline-block px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          {selectedFile ? selectedFile.name : "Select File"}
        </label>

        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 inline-block px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </button>
        )}
      </div>

      {/* Contact Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contactLists.map((list: ContactList) => (
          <div
            key={list._id}
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col"
          >
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">
                    {list.fileName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">
                      {list.contactCount} contacts
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {list.columns.slice(0, 3).map((column) => (
                      <span
                        key={column}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                      >
                        {column}
                      </span>
                    ))}
                    {list.columns.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{list.columns.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-auto justify-end">
              <button
                onClick={() => handlePreview(list._id, list.fileName)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Preview
              </button>
              <button
                onClick={() => deleteContactList.mutate(list._id)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Delete Contact List"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold">{previewFileName}</h3>
                <p className="text-sm text-gray-500">
                  {previewData.length} contacts
                </p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      {previewData.length > 0 &&
                        Object.keys(previewData[0]).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((contact, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        {Object.values(contact).map((value, idx) => (
                          <td
                            key={idx}
                            className="px-4 py-3 text-sm text-gray-900 break-words"
                          >
                            {value as React.ReactNode}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
