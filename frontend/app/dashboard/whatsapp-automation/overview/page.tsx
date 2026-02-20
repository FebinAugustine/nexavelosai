"use client";

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import WhatsAppAutomationSidebar from "../sidebar-menu";

function WhatsAppOverviewContent() {
  const { data: overviewData } = useQuery({
    queryKey: ["whatsappOverview"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/whatsapp/analytics",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  const { data: accountData } = useQuery({
    queryKey: ["whatsappAccount"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/whatsapp/accounts",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">WhatsApp Automation</h1>
          <p className="text-black">
            Connect and automate your WhatsApp Business communication
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <p className="text-sm text-black">Total Messages</p>
                <p className="text-2xl font-bold text-black">
                  {overviewData.totalMessages}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-black">Delivered</p>
                <p className="text-2xl font-bold text-black">
                  {overviewData.delivered}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <div>
                <p className="text-sm text-black">Read</p>
                <p className="text-2xl font-bold text-black">
                  {overviewData.read}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <p className="text-sm text-black">Failed</p>
                <p className="text-2xl font-bold text-black">
                  {overviewData.failed}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Account Status
          </h2>

          {accountData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">
                    {accountData.businessName}
                  </p>
                  <p className="text-sm text-black">
                    {accountData.phoneNumber}
                  </p>
                  <p className="text-sm text-black">
                    Status:{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        accountData.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {accountData.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-black">Quality Rating</p>
                  <p
                    className={`font-medium ${
                      accountData.qualityRating === "GREEN"
                        ? "text-green-600"
                        : accountData.qualityRating === "YELLOW"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {accountData.qualityRating || "N/A"}
                  </p>
                </div>
              </div>

              {accountData.qualityRating === "RED" && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">
                    ⚠️ Your quality rating is red. Please review WhatsApp
                    Business policies to improve.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">
                No WhatsApp Account Connected
              </h3>
              <p className="text-black mb-4">
                Connect your WhatsApp Business Account to start sending messages
              </p>
              <a
                href="/dashboard/whatsapp-automation/accounts"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                + Connect Account
              </a>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/dashboard/whatsapp-automation/campaigns"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-4">📱</span>
              <div>
                <h3 className="font-medium text-black">Create Campaign</h3>
                <p className="text-sm text-black">
                  Send messages to your contacts
                </p>
              </div>
            </a>

            <a
              href="/dashboard/whatsapp-automation/templates"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-4">📝</span>
              <div>
                <h3 className="font-medium text-black">Manage Templates</h3>
                <p className="text-sm text-black">
                  Create and manage message templates
                </p>
              </div>
            </a>

            <a
              href="/dashboard/whatsapp-automation/chats"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-4">💬</span>
              <div>
                <h3 className="font-medium text-black">View Chats</h3>
                <p className="text-sm text-black">See incoming messages</p>
              </div>
            </a>

            <a
              href="/dashboard/whatsapp-automation/analytics"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-4">📈</span>
              <div>
                <h3 className="font-medium text-black">View Analytics</h3>
                <p className="text-sm text-black">See message performance</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-black">
              WhatsApp Business API Tips
            </h3>
            <p className="text-black mb-2">
              • All outgoing messages must use pre-approved templates
            </p>
            <p className="text-black mb-2">
              • Templates can take 1-2 business days to get approved
            </p>
            <p className="text-black mb-2">
              • Maintain a quality rating above green to keep sending privileges
            </p>
            <p className="text-black">
              • Respond to incoming messages within 24 hours for free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">WhatsApp Automation</h1>
              <p className="text-black">
                Connect and automate your WhatsApp Business communication
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      }
    >
      <WhatsAppOverviewContent />
    </Suspense>
  );
}
