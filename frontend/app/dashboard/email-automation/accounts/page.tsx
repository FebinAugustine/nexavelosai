"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";

// Separate component that handles search params
function EmailAccountsContent() {
  const [isConnecting, setIsConnecting] = useState(false);
  const searchParams = useSearchParams();

  const { data: googleAccount, refetch } = useQuery({
    queryKey: ["googleAccount"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/email/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      // Create a hidden iframe or popup to handle the redirect
      const token = localStorage.getItem("token");
      console.log("Frontend token to pass to backend:", token);
      const authUrl = `http://localhost:5000/auth/google?token=${encodeURIComponent(token || "")}`;

      // Create a popup window for Google authentication
      const popup = window.open(
        authUrl,
        "google-auth",
        "width=600,height=600,scrollbars=yes,resizable=yes",
      );

      if (!popup) {
        // If popup is blocked, redirect directly
        window.location.href = authUrl;
      }

      // Check if popup closed (user canceled)
      const checkPopup = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkPopup);
          setIsConnecting(false);
          refetch();
        }
      }, 1000);
    } catch (error) {
      console.error("Error connecting Google account:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.delete("http://localhost:5000/email/accounts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      refetch();
    } catch (error) {
      console.error("Error disconnecting Google account:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Accounts</h1>
          <p className="text-gray-600">
            Connect and manage your Gmail accounts
          </p>
        </div>
        <button
          onClick={handleConnect}
          disabled={isConnecting || !!googleAccount}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? "Connecting..." : "+ Connect Gmail"}
        </button>
      </div>

      {googleAccount ? (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img
                  src={googleAccount.picture}
                  alt={googleAccount.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">
                      {googleAccount.name}
                    </h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Default
                    </span>
                  </div>
                  <p className="text-gray-600">{googleAccount.email}</p>
                  <p className="text-sm text-gray-500">
                    Connected {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
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

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-gray-600"
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
                <h3 className="text-lg font-semibold mb-2">
                  About Gmail Accounts
                </h3>
                <p className="text-gray-600 mb-2">
                  Connect your Gmail accounts to send email campaigns. Each
                  account can be used to send emails from that specific address.
                </p>
                <p className="text-gray-600 mb-2">
                  The default account will be pre-selected when creating new
                  campaigns.
                </p>
                <p className="text-gray-600">
                  Gmail has sending limits (around 500 emails per day for
                  personal accounts). Consider using multiple accounts for
                  larger campaigns.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No accounts connected
            </h3>
            <p className="text-gray-600 mb-8">
              Connect a Gmail account to start sending email campaigns
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? "Connecting..." : "+ Connect Gmail Account"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-gray-600"
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
                <h3 className="text-lg font-semibold mb-2">
                  About Gmail Accounts
                </h3>
                <p className="text-gray-600 mb-2">
                  Connect your Gmail accounts to send email campaigns. Each
                  account can be used to send emails from that specific address.
                </p>
                <p className="text-gray-600 mb-2">
                  The default account will be pre-selected when creating new
                  campaigns.
                </p>
                <p className="text-gray-600">
                  Gmail has sending limits (around 500 emails per day for
                  personal accounts). Consider using multiple accounts for
                  larger campaigns.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
export default function EmailAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Email Accounts</h1>
              <p className="text-gray-600">
                Connect and manage your Gmail accounts
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      }
    >
      <EmailAccountsContent />
    </Suspense>
  );
}
