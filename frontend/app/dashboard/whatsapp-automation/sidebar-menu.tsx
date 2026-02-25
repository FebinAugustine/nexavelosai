"use client";

import { useState } from "react";
import Link from "next/link";

export default function WhatsAppAutomationSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      title: "Overview",
      href: "/dashboard/whatsapp-automation/overview",
      icon: "📊",
    },
    {
      title: "Accounts",
      href: "/dashboard/whatsapp-automation/accounts",
      icon: "🔗",
    },
    {
      title: "Contacts",
      href: "/dashboard/contacts",
      icon: "👥",
    },
    {
      title: "Templates",
      href: "/dashboard/whatsapp-automation/templates",
      icon: "📝",
    },
    {
      title: "Campaigns",
      href: "/dashboard/whatsapp-automation/campaigns",
      icon: "📱",
    },
    {
      title: "Chats",
      href: "/dashboard/whatsapp-automation/chats",
      icon: "💬",
    },
    {
      title: "Analytics",
      href: "/dashboard/whatsapp-automation/analytics",
      icon: "📈",
    },
  ];

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <span className="flex items-center">📱 WhatsApp Automation</span>
        <span
          className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="ml-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-2">{item.icon}</span>
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
