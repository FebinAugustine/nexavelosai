"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { StatCard } from "@/components/StatCard";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCard } from "@/components/PricingCard";
import { TestimonialCard } from "@/components/TestimonialCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100/20 to-green-100/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <Badge className="mb-4">
              🚀 Now supporting React & Next.js components
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
            Create Custom AI Chat Agents
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Effortlessly
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-12 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed">
            Empower your website with personalized AI chat widgets. Integrate
            leading AI providers like Google Gemini, OpenAI ChatGPT, and
            OpenRouter. Monitor performance and scale with flexible plans.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Button href="/register" variant="primary" size="lg">
              Start Building Now
            </Button>
            <Button href="#features" variant="secondary" size="lg">
              Learn More
            </Button>
          </div>
          <div className="mt-12 sm:mt-16 flex justify-center">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-emerald-200/60">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 divide-x-0 sm:divide-x divide-gray-200">
                <StatCard
                  value="10K+"
                  label="Active Agents"
                  valueColor="text-[#3BC1A8]"
                />
                <StatCard
                  value="1M+"
                  label="Conversations"
                  valueColor="text-[#249E94]"
                />
                <StatCard
                  value="99.9%"
                  label="Uptime"
                  valueColor="text-[#0C7779]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
      >
        {/* Modern geometric background pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-emerald-100 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-green-100 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-tr from-emerald-50 to-transparent rounded-full blur-3xl"></div>
          </div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, rgb(16 185 129 / 0.03) 1px, transparent 1px),
                              linear-gradient(to bottom, rgb(16 185 129 / 0.03) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Why Choose NexaVelosAI?
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto">
              Everything you need to deploy AI chat agents on your website with
              enterprise-grade security and performance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={
                <svg
                  className="w-6 sm:w-8 h-6 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              title="Lightning Fast Integration"
              description="Generate embeddable JavaScript snippets or React components in seconds. No coding required - just copy, paste, and you're live."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 sm:w-8 h-6 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Multiple AI Providers"
              description="Support for Google Gemini, OpenAI ChatGPT, and OpenRouter. Choose the perfect AI model for your specific use case."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 sm:w-8 h-6 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              title="Advanced Analytics"
              description="Track chat interactions, user engagement, and agent performance with detailed analytics and real-time insights."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-16 sm:py-24 bg-gradient-to-br from-emerald-500/5 via-white to-green-500/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto">
              Choose the perfect plan for your AI chat agent needs. Scale as you
              grow with our flexible pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="Regular"
              price="₹499"
              period="/month"
              description="Perfect for small businesses and startups"
              features={[
                "2 AI Agents",
                "Basic Analytics",
                "Email Support",
                "JavaScript & React Components",
              ]}
              ctaText="Get Started"
              ctaHref="/register"
            />

            <PricingCard
              title="Special"
              price="₹899"
              period="/month"
              description="Ideal for growing businesses"
              features={[
                "5 AI Agents",
                "Advanced Analytics",
                "Priority Support",
                "Custom Branding",
                "JavaScript & React Components",
              ]}
              ctaText="Get Started"
              ctaHref="/register"
              featured={true}
            />

            <PricingCard
              title="Agency"
              price="Custom"
              description="For large agencies and enterprises"
              features={[
                "Unlimited AI Agents",
                "Custom Analytics",
                "Dedicated Support",
                "White-label Solution",
                "JavaScript & React Components",
              ]}
              ctaText="Contact Sales"
              ctaHref="mailto:support@nexavelosai.com?subject=Agency Plan Inquiry"
              customPrice={true}
            />
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">
              All plans include SSL security, 99.9% uptime guarantee, and 24/7
              monitoring.
            </p>
            <p className="text-sm text-gray-500">
              Prices in INR (₹). Monthly billing. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-16 sm:py-24 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto">
              Join thousands of businesses transforming their customer
              experience with AI
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <TestimonialCard
              quote="NexaVelosAI transformed our customer support. The AI agents handle 80% of our inquiries automatically, saving us countless hours."
              author="John Doe"
              role="CEO, TechCorp"
              initials="JD"
              avatarBg="from-emerald-500 to-green-500"
            />
            <TestimonialCard
              quote="The analytics dashboard gives us incredible insights. We've improved our conversion rates by 40% since implementing NexaVelosAI."
              author="Jane Smith"
              role="Marketing Director, InnovateCo"
              initials="JS"
              avatarBg="from-green-500 to-teal-500"
            />
            <TestimonialCard
              quote="Setup was incredibly easy. Within minutes, we had our first AI agent up and running on our website. The React components are perfect."
              author="Mike Brown"
              role="CTO, StartupXYZ"
              initials="MB"
              avatarBg="from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Website?
          </h2>
          <p className="text-base sm:text-xl text-emerald-100 mb-10 sm:mb-12 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            Join thousands of businesses enhancing their customer experience
            with intelligent AI chat agents. Start building your first agent
            today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <a
              href="/register"
              className="bg-white text-emerald-600 px-8 sm:px-10 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start Building Now
            </a>
            <a
              href="#features"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:bg-white/20 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
