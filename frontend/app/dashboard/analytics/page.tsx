"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSocket } from "../../socket-context";
import axios from "axios";

interface AnalyticsDashboardProps {
  agentId?: string;
}

export default function AnalyticsDashboard({
  agentId,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("7d");
  const [metricType, setMetricType] = useState("chatVolume");
  const [showReports, setShowReports] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    metrics: ["chatVolume", "responseTime", "conversionRate"],
    dimensions: ["time", "agent", "geo"],
    timeRange: "30d",
    format: "csv",
  });
  const socket = useSocket();
  const queryClient = useQueryClient();

  // Socket listeners for real-time updates
  useEffect(() => {
    socket?.on("analytics:update", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    });

    return () => {
      socket?.off("analytics:update");
    };
  }, [socket, queryClient]);

  // Chat Volume Trends Query
  const { data: chatVolumeData } = useQuery({
    queryKey: ["chatVolume", timeRange, agentId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        timeRange,
        ...(agentId && { agentId }),
      });

      const response = await axios.get(
        `http://localhost:5000/analytics/chat-volume?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // Response Time Metrics Query
  const { data: responseTimeData } = useQuery({
    queryKey: ["responseTime", timeRange, agentId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        ...(agentId && { agentId }),
      });

      const response = await axios.get(
        `http://localhost:5000/analytics/response-times?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // Lead Conversion Metrics Query
  const { data: conversionData } = useQuery({
    queryKey: ["conversionRate", timeRange, agentId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        ...(agentId && { agentId }),
      });

      const response = await axios.get(
        `http://localhost:5000/analytics/conversion-rates?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // Engagement Metrics Query
  const { data: engagementData } = useQuery({
    queryKey: ["engagement", timeRange, agentId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        ...(agentId && { agentId }),
      });

      const response = await axios.get(
        `http://localhost:5000/analytics/engagement?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // Geographic Data Query
  const { data: geographicData } = useQuery({
    queryKey: ["geographic", timeRange, agentId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        ...(agentId && { agentId }),
      });

      const response = await axios.get(
        `http://localhost:5000/analytics/geographic?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // Agent Performance Query
  const { data: agentPerformanceData } = useQuery({
    queryKey: ["agentPerformance", timeRange],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/analytics/agent-performance",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
    enabled: !agentId,
  });

  // Generate Report Mutation
  const generateReport = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/analytics/reports",
        reportConfig,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `analytics-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });

  // Render dashboard with multiple chart types
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <button
          onClick={() => setShowReports(!showReports)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showReports ? "Hide Reports" : "Generate Report"}
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {["24h", "7d", "30d", "90d", "1y"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg ${
              timeRange === range
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Custom Reports Section */}
      {showReports && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Generate Custom Report</h3>

          {/* Metrics Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metrics
            </label>
            <div className="space-x-2">
              {[
                "chatVolume",
                "responseTime",
                "conversionRate",
                "engagement",
              ].map((metric) => (
                <label key={metric} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.metrics.includes(metric)}
                    onChange={(e) => {
                      setReportConfig((prev) => ({
                        ...prev,
                        metrics: e.target.checked
                          ? [...prev.metrics, metric]
                          : prev.metrics.filter((m) => m !== metric),
                      }));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Dimensions Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensions
            </label>
            <div className="space-x-2">
              {["time", "agent", "geo"].map((dimension) => (
                <label key={dimension} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.dimensions.includes(dimension)}
                    onChange={(e) => {
                      setReportConfig((prev) => ({
                        ...prev,
                        dimensions: e.target.checked
                          ? [...prev.dimensions, dimension]
                          : prev.dimensions.filter((d) => d !== dimension),
                      }));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {dimension.charAt(0).toUpperCase() + dimension.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={reportConfig.timeRange}
              onChange={(e) =>
                setReportConfig((prev) => ({
                  ...prev,
                  timeRange: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>

          {/* Format Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={reportConfig.format}
              onChange={(e) =>
                setReportConfig((prev) => ({
                  ...prev,
                  format: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => generateReport.mutate()}
            disabled={generateReport.isPending}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300"
          >
            {generateReport.isPending ? "Generating..." : "Generate Report"}
          </button>
        </div>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Chats"
          value={conversionData?.totalSessions || 0}
          change="+12.5%"
          trend="up"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${(responseTimeData?.avg || 0).toFixed(0)}ms`}
          change="-8.2%"
          trend="down"
        />
        <MetricCard
          title="Lead Conversion"
          value={`${(conversionData?.conversionRate || 0).toFixed(1)}%`}
          change="+3.2%"
          trend="up"
        />
        <MetricCard
          title="Avg Messages"
          value={(engagementData?.avgMessages || 0).toFixed(1)}
          change="+15.3%"
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Volume Trends */}
        <ChartCard title="Chat Volume Trends" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chatVolumeData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Response Time Distribution */}
        <ChartCard title="Response Time Distribution" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { range: "0-1s", count: 150 },
                { range: "1-2s", count: 280 },
                { range: "2-3s", count: 120 },
                { range: "3-4s", count: 80 },
                { range: "4s+", count: 50 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Geographic Distribution */}
        <ChartCard title="Geographic Distribution" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={geographicData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ payload }: any) =>
                  `${payload.country}: ${payload.count}`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {[
                  "#0088FE",
                  "#00C49F",
                  "#FFBB28",
                  "#FF8042",
                  "#8884d8",
                  "#82ca9d",
                ].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Agent Performance */}
        <ChartCard title="Agent Performance" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSessions" fill="#3b82f6" name="Total Chats" />
              <Bar
                dataKey="conversionRate"
                fill="#10b981"
                name="Conversion %"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
}

function MetricCard({ title, value, change, trend }: MetricCardProps) {
  const trendColor = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-500",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="text-sm text-gray-600 mb-2">{title}</h4>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-sm font-semibold ${trendColor[trend]}`}>
          {change}
        </div>
      </div>
    </div>
  );
}

// Chart Card Component
interface ChartCardProps {
  title: string;
  height?: number;
  children: React.ReactNode;
}

function ChartCard({ title, height = 300, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="w-full" style={{ height }}>
        {children}
      </div>
    </div>
  );
}
