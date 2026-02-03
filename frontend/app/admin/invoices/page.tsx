"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/admin-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// TODO: When mutation functions (create, update, delete) are added,
// make sure to invalidate the 'adminInvoices' query to refetch the data.
// Example: queryClient.invalidateQueries({ queryKey: ['adminInvoices'] });

interface Invoice {
  _id: string;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
  amount: number;
  date: string;
  status: string;
  razorpayPaymentId?: string;
}

interface User {
  _id: string;
  email: string;
  role: string;
  plan: string;
  agentLimit: number;
  isVerified: boolean;
  createdAt: string;
}

// Query functions
const fetchInvoicesData = async () => {
  const response = await adminApi.getInvoices();
  return response.data;
};

const fetchUsersData = async () => {
  const response = await adminApi.getUsers();
  return response.data;
};

export default function AdminInvoicesPage() {
  const queryClient = useQueryClient();
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 12;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const { data: invoicesRaw, isLoading: isLoadingInvoices, error: errorInvoices } = useQuery<any[]>({
    queryKey: ['adminInvoices'],
    queryFn: fetchInvoicesData,
  });

  const { data: usersRaw, isLoading: isLoadingUsers, error: errorUsers } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: fetchUsersData,
  });

  const isLoading = isLoadingInvoices || isLoadingUsers;
  const error = errorInvoices || errorUsers;

  const invoices: Invoice[] = (invoicesRaw && usersRaw) ? invoicesRaw.map((inv: any) => {
    const user = usersRaw.find(u => u._id === inv.userId);
    return {
      ...inv,
      user: {
        _id: inv.userId,
        email: user ? user.email : 'Unknown',
      },
      date: new Date(inv.createdAt || inv.date).toISOString(),
      razorpayPaymentId: inv.razorpayPaymentId,
    };
  }) : [];

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(invoice => {
    const query = searchQuery.toLowerCase();
    const userEmail = invoice.user?.email || '';
    const invoiceStatus = invoice.status || '';
    const razorpayId = invoice.razorpayPaymentId || '';
    const formattedAmount = `₹${(invoice.amount / 100).toFixed(2)}`;

    return (
      userEmail.toLowerCase().includes(query) ||
      invoiceStatus.toLowerCase().includes(query) ||
      razorpayId.toLowerCase().includes(query) ||
      formattedAmount.toLowerCase().includes(query)
    );
  });

  // Reset currentPage to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate paginated invoices from filteredInvoices
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

  // Calculate total pages based on filteredInvoices
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  // Previous and Next page handlers
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Invoices</h1>
      </div>

      {/* Search Input Field */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search invoices by email, status, order ID, or amount..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentInvoices && currentInvoices.length > 0 ? (
          currentInvoices.map((invoice) => (
            <div key={invoice._id} className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                  {invoice.razorpayPaymentId || invoice._id}
                </h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{invoice.user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">₹{(invoice.amount / 100).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">No invoices found.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="mt-6 flex justify-center" aria-label="Pagination">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="mx-2">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
