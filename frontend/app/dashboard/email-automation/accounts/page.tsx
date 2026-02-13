"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";

// Separate component that handles search params
function EmailAccountsContent() {
  const [isConnecting, setIsConnecting] = useState(false);
  const searchParams = useSearchParams();

  const { data: googleAccounts, refetch } = useQuery({
    queryKey: ["googleAccounts"],
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

  const handleDisconnect = async (accountId: string) => {
    try {
      await axios.delete(`http://localhost:5000/email/accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      refetch();
    } catch (error) {
      console.error("Error disconnecting Google account:", error);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      await axios.put(
        `http://localhost:5000/email/accounts/${accountId}/default`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      refetch();
    } catch (error) {
      console.error("Error setting default account:", error);
    }
  };

  const MAX_ACCOUNTS = 10;
  const canAddMoreAccounts =
    !googleAccounts || googleAccounts.length < MAX_ACCOUNTS;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Email Accounts</h1>
          <p className="text-black">Connect and manage your Gmail accounts</p>
        </div>
        <button
          onClick={handleConnect}
          disabled={isConnecting || !canAddMoreAccounts}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? "Connecting..." : "+ Connect Gmail"}
        </button>
      </div>

      {googleAccounts && googleAccounts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {googleAccounts.map((account: any) => (
              <div
                key={account._id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <img
                      src={account.picture}
                      alt={account.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-black">
                          {account.name}
                        </h3>
                        {account.isDefault && (
                          <span className="px-2 py-1 bg-gray-100 text-black rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-black">{account.email}</p>
                      <p className="text-sm text-black">
                        Connected{" "}
                        {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!account.isDefault && (
                      <button
                        onClick={() => handleSetDefault(account._id)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Set as Default"
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(account._id)}
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
              </div>
            ))}
          </div>

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
                  About Gmail Accounts
                </h3>
                <p className="text-black mb-2">
                  Connect your Gmail accounts to send email campaigns. Each
                  account can be used to send emails from that specific address.
                </p>
                <p className="text-black mb-2">
                  The default account will be pre-selected when creating new
                  campaigns. You can set any connected account as the default.
                </p>
                <p className="text-black">
                  Gmail has sending limits (around 500 emails per day for
                  personal accounts). Consider using multiple accounts for
                  larger campaigns. Maximum {MAX_ACCOUNTS} accounts allowed.
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
                className="w-8 h-8 text-black"
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
            <p className="text-black mb-8">
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
                <h3 className="text-lg font-semibold mb-2">
                  About Gmail Accounts
                </h3>
                <p className="text-black mb-2">
                  Connect your Gmail accounts to send email campaigns. Each
                  account can be used to send emails from that specific address.
                </p>
                <p className="text-black mb-2">
                  The default account will be pre-selected when creating new
                  campaigns. You can set any connected account as the default.
                </p>
                <p className="text-black">
                  Gmail has sending limits (around 500 emails per day for
                  personal accounts). Consider using multiple accounts for
                  larger campaigns. Maximum {MAX_ACCOUNTS} accounts allowed.
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
              <p className="text-black">
                Connect and manage your Gmail accounts
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      }
    >
      <EmailAccountsContent />
    </Suspense>
  );
}
