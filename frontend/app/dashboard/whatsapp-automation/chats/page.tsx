"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function WhatsAppChatsContent() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const queryClient = useQueryClient();

  const { data: chatSessions } = useQuery({
    queryKey: ["whatsappChatSessions"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/whatsapp/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const { data: selectedChat } = useQuery({
    queryKey: ["whatsappChat", selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return null;
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/whatsapp/chats/${selectedChatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    enabled: !!selectedChatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { chatId: string; text: string }) => {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/whatsapp/chats/${messageData.chatId}/messages`,
        { text: messageData.text },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["whatsappChat", selectedChatId],
      });
      queryClient.invalidateQueries({ queryKey: ["whatsappChatSessions"] });
      setNewMessage("");
      setIsSending(false);
    },
    onError: (error: any) => {
      console.error("Error sending message:", error);
      setIsSending(false);
    },
  });

  const handleSendMessage = async () => {
    if (!selectedChatId || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        chatId: selectedChatId,
        text: newMessage.trim(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 43200)
      return `${Math.floor(diffInMinutes / 1440)} days ago`;

    return date.toLocaleDateString();
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "SENT":
        return "✓";
      case "DELIVERED":
        return "✓✓";
      case "READ":
        return "✓✓ (Read)";
      case "FAILED":
        return "✗ Failed";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Chats</h1>
          <p className="text-black">
            View and respond to incoming WhatsApp messages
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Chat List</h2>

            {chatSessions && chatSessions.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {chatSessions.map((session: any) => (
                  <div
                    key={session._id}
                    onClick={() => setSelectedChatId(session._id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChatId === session._id
                        ? "bg-green-50 border border-green-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-black">
                        {session.contactName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(session.lastMessageAt || session.createdAt)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {session.lastMessage || "No messages yet"}
                    </div>
                    {session.unreadCount > 0 && (
                      <div className="inline-block px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium mt-1">
                        {session.unreadCount} unread
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-black mb-2">
                  No chats yet
                </h3>
                <p className="text-black">
                  Start chatting by sending a message or waiting for incoming
                  messages
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Details */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-black">
                      {selectedChat.contactName ||
                        selectedChat.phoneNumber ||
                        "Unknown"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Phone: {selectedChat.phoneNumber || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Status:{" "}
                      {selectedChat.status === "ACTIVE" ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((message: any, index: number) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender === "BOT"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg ${
                          message.sender === "BOT"
                            ? "bg-gray-100 text-gray-900 rounded-tl-none"
                            : "bg-green-500 text-white rounded-tr-none"
                        }`}
                      >
                        <div className="text-sm">
                          {message.text || message.content}
                        </div>
                        <div className="text-xs mt-1 opacity-75">
                          {formatDate(message.timestamp || message.createdAt)}
                          {message.status && message.sender === "BOT" && (
                            <span className="ml-1">
                              {getMessageStatus(message.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-lg font-medium text-black mb-2">
                      No messages yet
                    </h3>
                    <p className="text-black">
                      Start the conversation by sending a message
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    style={{ minHeight: "40px", maxHeight: "200px" }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center h-[600px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a chat</h3>
              <p className="text-black mb-8">
                Choose a chat from the list to view and respond to messages
              </p>
            </div>
          )}
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
              About WhatsApp Chats
            </h3>
            <p className="text-black mb-2">
              • Incoming messages are automatically displayed in the chat list
            </p>
            <p className="text-black mb-2">
              • You can respond to messages using free-form text or templates
            </p>
            <p className="text-black mb-2">
              • Messages sent within 24 hours don't need approval
            </p>
            <p className="text-black">
              • Maintain a quality rating above green to keep messaging
              privileges
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Chats</h1>
              <p className="text-black">
                View and respond to incoming WhatsApp messages
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      }
    >
      <WhatsAppChatsContent />
    </Suspense>
  );
}
