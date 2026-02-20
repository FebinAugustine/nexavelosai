"use client";

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function WhatsAppAnalyticsContent() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: overallAnalytics } = useQuery({
    queryKey: ["whatsappAnalyticsOverall"],
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

  const { data: templatePerformance } = useQuery({
    queryKey: ["whatsappAnalyticsTemplates"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/whatsapp/analytics/templates",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  // Campaign Analytics Query - We need to get all campaigns first and then their analytics
  const { data: campaigns } = useQuery({
    queryKey: ["whatsapp-campaigns"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/whatsapp/campaigns",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  const { data: contactAnalytics } = useQuery({
    queryKey: ["whatsappAnalyticsContacts"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/whatsapp/analytics/contacts",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  // Period Analytics Query (replaces trends)
  const { data: periodAnalytics } = useQuery({
    queryKey: ["whatsappAnalyticsTrends", timeRange],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      // Convert frontend timeRange to backend period format
      const periodMap: Record<string, string> = {
        "7d": "week",
        "30d": "month",
        "90d": "year",
      };
      const period = periodMap[timeRange] || "week";

      const response = await axios.get(
        "http://localhost:5000/whatsapp/analytics/period",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { period },
        },
      );
      return response.data;
    },
  });

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-100 text-blue-600";
      case "DELIVERED":
        return "bg-green-100 text-green-600";
      case "READ":
        return "bg-yellow-100 text-yellow-600";
      case "FAILED":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Analytics</h1>
          <p className="text-black">
            Track and analyze your WhatsApp communication
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "7d"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "30d"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange("90d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "90d"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setTimeRange("1y")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "1y"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-black">
                {overallAnalytics?.totalMessages || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-black">
                {overallAnalytics?.deliveredCount || 0}
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
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-black">
                {overallAnalytics?.readCount || 0}
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
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-black">
                {overallAnalytics?.failedCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery and Read Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Delivery Rate
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Delivery Rate</span>
              <span className="text-xl font-bold text-black">
                {overallAnalytics?.deliveryRate
                  ? formatPercentage(overallAnalytics.deliveryRate)
                  : "0%"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${overallAnalytics?.deliveryRate || 0}%` }}
              ></div>
            </div>
            <div className="flex space-x-2">
              {["SENT", "DELIVERED", "READ", "FAILED"].map((status) => (
                <div key={status} className="flex items-center space-x-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "SENT"
                        ? "bg-blue-500"
                        : status === "DELIVERED"
                          ? "bg-green-500"
                          : status === "READ"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600">
                    {status}: {overallAnalytics?.statusCounts?.[status] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Read Rate</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Read Rate</span>
              <span className="text-xl font-bold text-black">
                {overallAnalytics?.readRate
                  ? formatPercentage(overallAnalytics.readRate)
                  : "0%"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${overallAnalytics?.readRate || 0}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              Based on messages delivered in the last {timeRange}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">
          Campaign Performance
        </h2>

        {campaigns && campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Campaign Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Total Messages
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Delivered
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Read
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Failed
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Delivery Rate
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Read Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign: any) => (
                  <tr key={campaign._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-black">
                      {campaign.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {campaign.totalMessages}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {campaign.deliveredCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {campaign.readCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {campaign.failedCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {formatPercentage(campaign.deliveryRate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {formatPercentage(campaign.readRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">
              No campaign data
            </h3>
            <p className="text-black">
              Run your first campaign to see performance data
            </p>
          </div>
        )}
      </div>

      {/* Template Performance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">
          Template Performance
        </h2>

        {templatePerformance && templatePerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Template Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Total Messages
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Delivered
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Read
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Failed
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Delivery Rate
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Read Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {templatePerformance.map((template: any) => (
                  <tr key={template._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-black">
                      {template.templateName}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {template.totalMessages}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {template.deliveredCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {template.readCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {template.failedCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {formatPercentage(template.deliveryRate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {formatPercentage(template.readRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">
              No template data
            </h3>
            <p className="text-black">
              Use your first template in a campaign to see performance data
            </p>
          </div>
        )}
      </div>

      {/* Contact Analytics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">
          Contact Analysis
        </h2>

        {contactAnalytics && contactAnalytics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Phone Number
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Total Messages
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Last Message At
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-black">
                    Response Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {contactAnalytics.map((contact: any) => (
                  <tr
                    key={contact.phoneNumber}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-black">
                      {contact.phoneNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {contact.totalMessages}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {new Date(contact.lastMessageAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {formatPercentage(contact.responseRate || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">
              No contact data
            </h3>
            <p className="text-black">
              Send messages to your first contacts to see analytics
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
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
              About WhatsApp Analytics
            </h3>
            <p className="text-black mb-2">
              • Track your message delivery and read rates
            </p>
            <p className="text-black mb-2">
              • Monitor campaign and template performance
            </p>
            <p className="text-black mb-2">
              • Analyze contact engagement and response rates
            </p>
            <p className="text-black mb-2">
              • Data is automatically tracked for all WhatsApp communication
            </p>
            <p className="text-black">
              • Maintain a high delivery rate (&gt;95%) for optimal performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-black">
                Track and analyze your WhatsApp communication
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      }
    >
      <WhatsAppAnalyticsContent />
    </Suspense>
  );
}
