"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const socketInstance = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
      {
        auth: {
          token: `${token}`,
        },
      },
    );

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Handle new invitation notifications
    socketInstance.on("newInvitation", (data: any) => {
      console.log("New invitation received:", data);
      toast.success(
        `You have been invited to join the team "${data.teamName}"!`,
        {
          duration: 5000,
          icon: "👥",
        },
      );
    });

    // Handle webhook event notifications
    socketInstance.on("webhookEvent", (data: any) => {
      console.log("Webhook event received:", data);
      const eventType = data.eventType;
      const status = data.status;

      let message = `Webhook event: ${eventType}`;
      let icon = "🔔";

      if (status === "success") {
        message = `Webhook event succeeded: ${eventType}`;
        icon = "✅";
      } else if (status === "failure") {
        message = `Webhook event failed: ${eventType}`;
        icon = "❌";
      } else if (status === "pending") {
        message = `Webhook event pending: ${eventType}`;
        icon = "⏳";
      }

      toast(message, {
        duration: 5000,
        icon: icon,
      });
    });

    // Handle campaign updates
    socketInstance.on("campaignUpdate", (campaign: any) => {
      console.log("Campaign update received:", campaign);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
