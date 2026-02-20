"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";

function WhatsAppAccountsContent() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    phoneNumberId: "",
    accessToken: "",
    businessName: "",
    whatsappBusinessAccountId: "",
    webhookUrl: "",
    webhookVerifyToken: "",
  });

  const searchParams = useSearchParams();

  const { data: whatsappAccounts, refetch } = useQuery({
    queryKey: ["whatsappAccounts"],
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

  // Check if we just connected an account and refetch data
  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected === "true") {
      refetch();
    }
  }, [searchParams, refetch]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await axios.post(
        "http://localhost:5000/whatsapp/accounts/connect",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      refetch();
      setFormData({
        phoneNumber: "",
        phoneNumberId: "",
        accessToken: "",
        businessName: "",
        whatsappBusinessAccountId: "",
        webhookUrl: "",
        webhookVerifyToken: "",
      });
    } catch (error) {
      console.error("Error connecting WhatsApp account:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.post(
        "http://localhost:5000/whatsapp/accounts/disconnect",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      refetch();
    } catch (error) {
      console.error("Error disconnecting WhatsApp account:", error);
    }
  };

  const handleValidate = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/whatsapp/accounts/validate",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      console.log("Validation result:", response.data);
    } catch (error) {
      console.error("Error validating account:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">WhatsApp Accounts</h1>
          <p className="text-black">
            Connect and manage your WhatsApp Business Account
          </p>
        </div>
      </div>

      {whatsappAccounts ? (
        <>
          {/* Connected Account */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-black">
                      {whatsappAccounts.businessName}
                    </h3>
                    {whatsappAccounts.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-black">{whatsappAccounts.phoneNumber}</p>
                  <p className="text-sm text-black">
                    Connected{" "}
                    {new Date(whatsappAccounts.createdAt).toLocaleDateString()}
                  </p>
                  {whatsappAccounts.qualityRating && (
                    <p className="text-sm text-black">
                      Quality Rating:{" "}
                      <span
                        className={`font-medium ${
                          whatsappAccounts.qualityRating === "GREEN"
                            ? "text-green-600"
                            : whatsappAccounts.qualityRating === "YELLOW"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {whatsappAccounts.qualityRating}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleValidate}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Validate Connection"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Disconnect Account"
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

            {/* Account Details */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-black">Phone Number ID:</span>
                <code className="text-xs text-black bg-gray-100 px-2 py-1 rounded">
                  {whatsappAccounts.phoneNumberId}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-black">Business Account ID:</span>
                <code className="text-xs text-black bg-gray-100 px-2 py-1 rounded">
                  {whatsappAccounts.whatsappBusinessAccountId || "N/A"}
                </code>
              </div>
              {whatsappAccounts.webhookUrl && (
                <div className="flex justify-between">
                  <span className="text-sm text-black">Webhook URL:</span>
                  <code className="text-xs text-black bg-gray-100 px-2 py-1 rounded">
                    {whatsappAccounts.webhookUrl}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
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
                  About WhatsApp Business Account
                </h3>
                <p className="text-black mb-2">
                  Your WhatsApp Business Account is connected and ready to send
                  messages.
                </p>
                <p className="text-black mb-2">
                  The account is configured with your business phone number and
                  API credentials.
                </p>
                <p className="text-black">
                  You can send messages using pre-approved templates. Each
                  template must be reviewed and approved by WhatsApp before it
                  can be used.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Connect Account Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Connect WhatsApp Business Account
            </h3>
            <p className="text-black mb-6">
              To connect your WhatsApp Business Account, you'll need to enter
              your Meta Business API credentials.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={formData.phoneNumberId}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumberId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="100000000000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Business Account ID
                </label>
                <input
                  type="text"
                  value={formData.whatsappBusinessAccountId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappBusinessAccountId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="123456789012345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Access Token
                </label>
                <textarea
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="EAAT..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Webhook URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, webhookUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://your-domain.com/webhook"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Webhook Verify Token (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.webhookVerifyToken}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        webhookVerifyToken: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your-verify-token"
                  />
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={
                  isConnecting ||
                  !formData.phoneNumber ||
                  !formData.phoneNumberId ||
                  !formData.accessToken
                }
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Connecting..." : "Connect Account"}
              </button>
            </div>
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
                  Where to Find Your Credentials
                </h3>
                <p className="text-black mb-2">1. Go to Meta Business Suite</p>
                <p className="text-black mb-2">
                  2. Navigate to WhatsApp Business Platform → Settings
                </p>
                <p className="text-black mb-2">
                  3. Get your Phone Number ID, Business Account ID, and generate
                  a permanent access token
                </p>
                <p className="text-black mb-2">
                  4. Webhook setup is optional but recommended for tracking
                  message statuses
                </p>
                <p className="text-black">
                  Need help? Check our documentation or contact support.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function WhatsAppAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">WhatsApp Accounts</h1>
              <p className="text-black">
                Connect and manage your WhatsApp Business Account
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      }
    >
      <WhatsAppAccountsContent />
    </Suspense>
  );
}
