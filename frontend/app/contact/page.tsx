"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Contact() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState("idle"); // idle, submitting, success, error
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();

  // Check login status on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setStatusMessage("Sending your message...");

    try {
      const response = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setFormStatus("success");
      setStatusMessage(
        "Message sent successfully! We'll get back to you soon.",
      );
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset form status after 5 seconds
      setTimeout(() => {
        setFormStatus("idle");
        setStatusMessage("");
      }, 5000);
    } catch (error) {
      setFormStatus("error");
      setStatusMessage("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-200 via-white to-green-200">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
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
                href="/#features"
                className="text-gray-700 hover:text-[#0C7779] font-medium transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="/#pricing"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                Pricing
              </a>
              {isLoggedIn ? (
                <>
                  <a
                    href="/dashboard"
                    className="bg-gradient-to-r from-[#005461] to-[#0C7779] text-white px-6 py-2 rounded-xl hover:from-[#0C7779] hover:to-[#249E94] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-[#0C7779] hover:text-[#005461] font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors duration-200"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    Get Started
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-emerald-600 focus:outline-none"
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
          <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200/50">
            <div className="px-4 py-4 space-y-3">
              <a
                href="/#features"
                onClick={closeMobileMenu}
                className="block text-gray-700 hover:text-[#0C7779] font-medium py-2 transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="/#pricing"
                onClick={closeMobileMenu}
                className="block text-gray-700 hover:text-emerald-600 font-medium py-2 transition-colors duration-200"
              >
                Pricing
              </a>
              {isLoggedIn ? (
                <>
                  <a
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="block bg-gradient-to-r from-[#005461] to-[#0C7779] text-white px-6 py-3 rounded-xl hover:from-[#0C7779] hover:to-[#249E94] transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-center"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="block w-full text-[#0C7779] hover:text-[#005461] font-medium py-2 transition-colors duration-200 text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    onClick={closeMobileMenu}
                    className="block text-emerald-600 hover:text-emerald-800 font-medium py-2 transition-colors duration-200 text-center"
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
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Contact Hero Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-4">
            📧 Get in Touch
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
            Contact Us
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              We're Here to Help
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Have questions about our AI chat agents? Need support? We'd love to
            hear from you. Fill out the form below and our team will get back to
            you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 sm:py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
            {/* Contact Form */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-200/50">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
                Send us a Message
              </h2>

              {formStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-700 font-medium">
                      {statusMessage}
                    </span>
                  </div>
                </div>
              )}

              {formStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-700 font-medium">
                      {statusMessage}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm text-black"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm text-black"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm text-black"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Support Request</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm resize-vertical text-black"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === "submitting"}
                  className={`w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formStatus === "submitting" ? "animate-pulse" : ""
                  }`}
                >
                  {formStatus === "submitting" ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Info Cards */}
              <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-200/50">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        Email Us
                      </h4>
                      <p className="text-gray-600">support@nexavelosai.com</p>
                      <p className="text-gray-600">sales@nexavelosai.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        Call Us
                      </h4>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-gray-600">Mon-Fri, 9AM-6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        Visit Us
                      </h4>
                      <p className="text-gray-600">123 AI Avenue</p>
                      <p className="text-gray-600">San Francisco, CA 94107</p>
                      <p className="text-gray-600">United States</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-200/50">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="/#features"
                      className="flex items-center text-gray-600 hover:text-[#0C7779] transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 mr-2 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#pricing"
                      className="flex items-center text-gray-600 hover:text-[#0C7779] transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 mr-2 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center text-gray-600 hover:text-[#0C7779] transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 mr-2 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center text-gray-600 hover:text-[#0C7779] transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 mr-2 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-green-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">NV</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  NexaVelosAI
                </h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-lg leading-relaxed mb-6 max-w-md">
                Empowering websites with intelligent AI chat agents. Transform
                your customer experience with cutting-edge conversational AI
                technology.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a
                    href="/#features"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/#pricing"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-white transition-colors duration-200 font-medium text-emerald-400"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 NexaVelosAI. All rights reserved. Built with ❤️ for
              AI-powered customer experiences.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
