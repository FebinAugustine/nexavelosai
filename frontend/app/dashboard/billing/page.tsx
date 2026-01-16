"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  email: string;
  plan: string;
  agentLimit: number;
  domains: string[];
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  agents: number | string;
  features: string[];
}

export default function BillingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const router = useRouter();

  const plans: Plan[] = [
    {
      id: "regular",
      name: "Regular",
      price: 599,
      currency: "USD",
      interval: "month",
      agents: 2,
      features: ["2 AI Agents", "Basic Analytics", "Email Support"],
    },
    {
      id: "special",
      name: "Special",
      price: 899,
      currency: "USD",
      interval: "month",
      agents: 5,
      features: ["5 AI Agents", "Advanced Analytics", "Priority Support"],
    },
    {
      id: "agency",
      name: "Agency",
      price: 0,
      currency: "USD",
      interval: "month",
      agents: "Unlimited",
      features: [
        "Unlimited AI Agents",
        "Custom Analytics",
        "Dedicated Support",
      ],
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        toast.error("Failed to load user data");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubscribe = async (planId: string) => {
    if (planId === "agency") {
      // Contact for pricing
      window.location.href =
        "mailto:support@nexavelosai.com?subject=Agency Plan Inquiry";
      return;
    }

    if (!user) return;

    setSubscribing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/payments/subscribe",
        { plan: planId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const subscription = response.data.subscription;

      // Load Razorpay script if not loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => initiatePayment(subscription);
        document.body.appendChild(script);
      } else {
        initiatePayment(subscription);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create subscription"
      );
    } finally {
      setSubscribing(false);
    }
  };

  const initiatePayment = (subscription: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_key", // Use env var
      subscription_id: subscription.id,
      name: "NexaVelosAI",
      description: `Subscription for ${subscription.plan_id}`,
      handler: function (response: any) {
        toast.success("Payment successful!");
        // Refresh user data
        window.location.reload();
      },
      prefill: {
        email: user?.email,
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Billing & Plans
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your needs and start building AI agents.
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Current Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Plan</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                {user?.plan}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Agent Limit</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {user?.agentLimit === -1 ? "Unlimited" : user?.agentLimit}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-lg font-semibold text-green-600">
                Active
              </dd>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => router.push("/dashboard/billing-history")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              View Billing History
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white shadow rounded-lg p-6 ${
                user?.plan === plan.id ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                {plan.price > 0 ? (
                  <p className="mt-4 text-4xl font-bold text-gray-900">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">
                      /{plan.interval}
                    </span>
                  </p>
                ) : (
                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    Contact for pricing
                  </p>
                )}
                <p className="mt-2 text-gray-600">
                  {plan.agents}{" "}
                  {typeof plan.agents === "number" ? "Agents" : ""}
                </p>
              </div>
              <ul className="mt-6 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {user?.plan === plan.id ? (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {subscribing
                      ? "Processing..."
                      : plan.id === "agency"
                      ? "Contact Us"
                      : "Subscribe"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
