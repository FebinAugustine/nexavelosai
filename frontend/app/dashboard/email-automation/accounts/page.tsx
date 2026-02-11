"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function EmailAccountsPage() {
  const [isConnecting, setIsConnecting] = useState(false);

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

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await axios.get("http://localhost:5000/auth/google", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Error connecting Google account:", error);
    } finally {
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
        <h1 className="text-2xl font-bold">Email Accounts</h1>
      </div>

      {googleAccount ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <img
              src={googleAccount.picture}
              alt={googleAccount.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold">{googleAccount.name}</h3>
              <p className="text-gray-600">{googleAccount.email}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Disconnect Account
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">
              Connect Google Account
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your Google Account to send email campaigns
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            >
              {isConnecting ? "Connecting..." : "Connect Google Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
