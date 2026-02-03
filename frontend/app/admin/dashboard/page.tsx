"use client";

import { useAuth } from "../../auth-provider";
import { adminApi } from "../../../utils/admin-api";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

interface User {
  _id: string;
}

interface Agent {
  _id: string;
}

interface Invoice {
  _id: string;
  amount: number;
}

// Query functions
const fetchUsers = async () => {
  const response = await adminApi.getUsers();
  return response.data;
};

const fetchAgents = async () => {
  const response = await adminApi.getAgents();
  return response.data;
};

const fetchInvoices = async () => {
  const response = await adminApi.getInvoices();
  return response.data;
};

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const { data: users, isLoading: isLoadingUsers, error: errorUsers } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: fetchUsers,
  });

  const { data: agents, isLoading: isLoadingAgents, error: errorAgents } = useQuery<Agent[]>({
    queryKey: ['adminAgents'],
    queryFn: fetchAgents,
  });

  const { data: invoices, isLoading: isLoadingInvoices, error: errorInvoices } = useQuery<Invoice[]>({
    queryKey: ['adminInvoices'],
    queryFn: fetchInvoices,
  });

  const isLoading = isLoadingUsers || isLoadingAgents || isLoadingInvoices;
  const error = errorUsers || errorAgents || errorInvoices;

  const userCount = users?.length || 0;
  const agentCount = agents?.length || 0;
  const invoiceCount = invoices?.length || 0;
  const totalSales = invoices?.reduce((sum, invoice) => sum + (invoice.amount / 100), 0) || 0;

  if (!user) {
    return null; // AuthProvider handles redirection/loading
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error.message}</div>;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Overview</h1>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Users */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {/* Icon for Users */}
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{userCount}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Total Agents */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {/* Icon for Agents */}
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Agents</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{agentCount}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Total Invoices */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {/* Icon for Invoices */}
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M18 10H6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{invoiceCount}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Total Sales */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {/* Icon for Sales */}
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1L15 4H9.401C9.92 3.598 10.89 3 12 3zm0 0v3m0 3v3m0 3H12s.895 0 2-.895 2-3 2-3V7.105c.594.27 1 .863 1 1.895V19a2 2 0 01-2 2H7a2 2 0 01-2-2V9.105c0-1.032.406-1.625 1-1.895V10c0 .895 1.343 2 3 2s3 .895 3 2-1.343 2-3 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">₹{totalSales.toFixed(2)}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
