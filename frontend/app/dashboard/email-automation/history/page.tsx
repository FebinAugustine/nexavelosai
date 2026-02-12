"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Search, Download } from "lucide-react";

interface EmailHistoryItem {
  _id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  campaignName: string;
  status: "sent" | "failed" | "pending";
  sentAt: string;
}

export default function EmailHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("7d");

  // Fetch email history
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["email-history", searchQuery, dateRange],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/email/history", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchQuery, dateRange },
      });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email History</h1>
        <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-lg font-semibold mb-2">No Email History</h3>
            <p className="text-gray-600">No emails have been sent yet</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Recipient
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subject
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Campaign
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((email: EmailHistoryItem) => (
                  <tr key={email._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {email.recipientEmail}
                      </div>
                      <div className="text-sm text-gray-500">
                        {email.recipientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {email.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {email.campaignName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${"bg-green-100 text-green-800"}`}
                      >
                        {email.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(email.sentAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
