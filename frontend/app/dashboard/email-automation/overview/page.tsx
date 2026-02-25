"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface EmailAutomationOverviewPageProps {
  setActiveSection: (section: string) => void;
}

function EmailAutomationOverviewContent({
  setActiveSection,
}: EmailAutomationOverviewPageProps) {
  const { data: overviewData } = useQuery({
    queryKey: ["emailOverview"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/email/analytics",
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
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="text-gray-600">Overview of your email campaigns</p>
        </div>
        <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200">
          + New Campaign
        </button>
      </div>

      {overviewData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => setActiveSection("email-automation-accounts")}
              className="block w-full text-left"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-90">Connected Accounts</p>
                    <p className="text-3xl font-bold mt-2">
                      {overviewData.connectedAccounts}
                    </p>
                    <p className="text-sm opacity-80 mt-1">
                      Gmail accounts connected
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection("contacts")}
              className="block w-full text-left"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-90">Total Sent</p>
                    <p className="text-3xl font-bold mt-2">
                      {overviewData.totalSent}
                    </p>
                    <p className="text-sm opacity-80 mt-1">
                      +{overviewData.todaySent} today
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection("email-automation-templates")}
              className="block w-full text-left"
            >
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-90">Success Rate</p>
                    <p className="text-3xl font-bold mt-2">
                      {overviewData.successRate}%
                    </p>
                    <p className="text-sm opacity-80 mt-1">
                      {Number(overviewData.totalSent || 0) +
                        Number(overviewData.failed || 0)}{" "}
                      total emails
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection("email-automation-campaigns")}
              className="block w-full text-left"
            >
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-90">Active Campaigns</p>
                    <p className="text-3xl font-bold mt-2">
                      {overviewData.activeCampaigns}
                    </p>
                    <p className="text-sm opacity-80 mt-1">
                      {overviewData.totalCampaigns} total campaigns
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Campaigns
              </h2>
              <button
                onClick={() => setActiveSection("email-automation-campaigns")}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {overviewData.recentCampaigns.map((campaign: any) => (
                <div
                  key={campaign._id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-600">
                      {campaign.emailsSent} / {campaign.totalEmails} emails
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === "running"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : campaign.status === "paused"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {campaign.status}
                    </span>
                    <button
                      onClick={() => {
                        // First navigate to campaigns page
                        setActiveSection("email-automation-campaigns");
                        // We would typically also want to open the campaign details
                        // For now, just navigate to campaigns page
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setActiveSection("email-automation-accounts")}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer w-full text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Connect Account
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveSection("email-automation-contacts")}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer w-full text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload Contacts
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveSection("email-automation-templates")}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer w-full text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            <div>
              <p className="text-lg font-medium text-gray-900">
                Email Templates
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

interface EmailAutomationOverviewPageProps {
  setActiveSection: (section: string) => void;
}

export default function EmailAutomationOverviewPage({
  setActiveSection,
}: EmailAutomationOverviewPageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Overview of your email campaigns</p>
            </div>
            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200">
              + New Campaign
            </button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      }
    >
      <EmailAutomationOverviewContent setActiveSection={setActiveSection} />
    </Suspense>
  );
}
