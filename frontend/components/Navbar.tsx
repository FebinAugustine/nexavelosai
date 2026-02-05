"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

export const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-emerald-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NV</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                NexaVelosAI
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Pricing
            </a>
            {isLoggedIn === true ? (
              <>
                <Button href="/dashboard" variant="primary" size="md">
                  Dashboard
                </Button>
                <button
                  onClick={handleLogout}
                  className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  Logout
                </button>
              </>
            ) : isLoggedIn === false ? (
              <>
                <a
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  Login
                </a>
                <Button href="/register" variant="primary" size="md">
                  Get Started
                </Button>
              </>
            ) : (
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md p-2"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-emerald-200/50">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={closeMobileMenu}
              className="block text-gray-700 hover:text-emerald-600 font-medium py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md px-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={closeMobileMenu}
              className="block text-gray-700 hover:text-emerald-600 font-medium py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md px-2"
            >
              Pricing
            </a>
            {isLoggedIn === true ? (
              <>
                <a
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-center"
                >
                  Dashboard
                </a>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="block w-full text-emerald-600 hover:text-emerald-800 font-medium py-2 transition-colors duration-200 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : isLoggedIn === false ? (
              <>
                <a
                  href="/login"
                  onClick={closeMobileMenu}
                  className="block text-emerald-600 hover:text-emerald-800 font-medium py-2 transition-colors duration-200 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md"
                >
                  Login
                </a>
                <a
                  href="/register"
                  onClick={closeMobileMenu}
                  className="block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-center"
                >
                  Get Started
                </a>
              </>
            ) : (
              <div className="w-full h-8 bg-gray-200 rounded animate-pulse" />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
