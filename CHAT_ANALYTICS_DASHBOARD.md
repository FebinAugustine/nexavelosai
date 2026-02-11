# Chat Analytics Dashboard - Current Status

## Feature Overview

Create a comprehensive analytics dashboard that provides users with actionable insights into their chatbot performance, including chat volume trends, response times, lead conversion rates, user engagement metrics, geographic data, and custom reports with real-time updates.

**Business Value**: Enhances product stickiness by providing users with data-driven insights to optimize their chatbots for better results and higher conversion rates.

**Target Users**: Digital marketing agencies, sales teams, e-commerce businesses, service providers, and any user managing chatbots.

## Current Status

**⚠️ Feature Paused**: The analytics feature is currently paused and will be resumed after all other features have been completed.

## Implementation Progress

### Completed Components ✅

1. **Backend Analytics Service** - Fully implemented with all core analytics methods
2. **Backend Analytics Controller** - All API endpoints created and functional
3. **Frontend Dashboard UI** - Complete analytics dashboard with all chart types
4. **Custom Reports Feature** - Report generation and download functionality

### Files Created

- `backend/src/analytics/analytics.service.ts` - Core analytics logic with all metrics calculations
- `backend/src/analytics/analytics.controller.ts` - API endpoints for all analytics data
- `backend/src/analytics/analytics.module.ts` - NestJS module configuration
- `frontend/app/dashboard/analytics/page.tsx` - Complete frontend dashboard UI

### Functionality Implemented

- Chat volume trends (24h, 7d, 30d, 90d, 1y)
- Response time metrics (avg, min, max)
- Lead conversion rates
- User engagement metrics (avg messages, avg duration, total messages)
- Geographic data (country/city distribution)
- Agent performance metrics (per-agent stats)
- Custom report generation (CSV format)
- Real-time updates via Socket.io
- Time range selector
- Responsive dashboard design

## Next Steps

The analytics feature will be resumed after all other features in the roadmap have been completed. See `FEATURE-SUGGESTIONS.md` for the current implementation order.

## Current Analytics Data Available

Based on existing schemas, we have access to:

- Chat session data (timestamps, visitor info, IP address, user agent)
- Chat messages (content, role, timestamps)
- Lead data (capture time, status, custom fields)
- Agent performance metrics (chat count, total interactions)

## Implementation Timeline

**Total Estimated Time**: 4-5 weeks

## Phase 1: Analytics Data Infrastructure (1 week)

### 1.1 Extend Chat Session Schema

```typescript
// backend/src/agents/chat-session.schema.ts
@Schema({ timestamps: true })
export class ChatSession {
  // Existing fields...

  @Prop()
  duration?: number; // Total conversation duration in seconds

  @Prop({ type: Number, default: 0 })
  messageCount?: number; // Total messages in session

  @Prop({ type: Number, default: 0 })
  userMessageCount?: number; // User messages count

  @Prop({ type: Number, default: 0 })
  agentMessageCount?: number; // Agent messages count

  @Prop({ type: Number })
  avgResponseTime?: number; // Average response time in milliseconds

  @Prop({ type: [Number] })
  responseTimes?: number[]; // Individual response times

  @Prop()
  country?: string; // Country from IP geolocation

  @Prop()
  city?: string; // City from IP geolocation

  @Prop()
  region?: string; // Region/state from IP geolocation

  @Prop()
  zipCode?: string; // Zip code from IP geolocation

  @Prop({ type: Number })
  latitude?: number; // Latitude coordinate

  @Prop({ type: Number })
  longitude?: number; // Longitude coordinate

  @Prop({ default: false })
  convertedToLead?: boolean; // Whether session resulted in lead

  @Prop()
  exitPage?: string; // Page where conversation ended

  @Prop({ type: Object, default: {} })
  utmParameters?: Record<string, any>; // UTM tracking parameters
}
```

### 1.2 Create Analytics Service

```typescript
// backend/src/analytics/analytics.service.ts
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(ChatSession.name)
    private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(Lead.name)
    private leadModel: Model<LeadDocument>,
    @InjectModel(Agent.name)
    private agentModel: Model<AgentDocument>,
  ) {}

  // Core analytics methods
  async getChatVolumeTrends(userId: string, timeRange: string): Promise<any[]>;
  async getResponseTimeMetrics(userId: string): Promise<any>;
  async getLeadConversionMetrics(userId: string): Promise<any>;
  async getEngagementMetrics(userId: string): Promise<any>;
  async getGeographicData(userId: string): Promise<any[]>;
  async getAgentPerformance(userId: string): Promise<any[]>;
  async getCustomReport(userId: string, params: any): Promise<any>;
}
```

### 1.3 Create Analytics Controller

```typescript
// backend/src/analytics/analytics.controller.ts
@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("chat-volume")
  async getChatVolumeTrends(
    @User() user: any,
    @Query("timeRange") timeRange: string = "7d",
  ): Promise<ApiResponse<any[]>> {
    const data = await this.analyticsService.getChatVolumeTrends(
      user._id,
      timeRange,
    );
    return { success: true, data };
  }

  @Get("response-times")
  async getResponseTimeMetrics(@User() user: any): Promise<ApiResponse<any>> {
    const data = await this.analyticsService.getResponseTimeMetrics(user._id);
    return { success: true, data };
  }

  // Additional endpoints for other metrics...
}
```

### 1.4 Geolocation Integration

- Add IP geolocation service integration (e.g., MaxMind GeoLite2 or ip-api.com)
- Create middleware to automatically geolocate chat sessions
- Store geographic data in chat session documents

## Phase 2: Real-time Analytics System (1 week)

### 2.1 WebSocket Analytics Events

```typescript
// backend/src/events/events.gateway.ts
@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @SubscribeMessage("analytics:chatVolume")
  async handleChatVolume(client: Socket, payload: any): Promise<void> {
    // Broadcast real-time chat volume updates
  }

  @SubscribeMessage("analytics:responseTime")
  async handleResponseTime(client: Socket, payload: any): Promise<void> {
    // Broadcast real-time response time updates
  }
}
```

### 2.2 Real-time Metrics Calculation

- Implement Redis for caching analytics calculations
- Create background jobs for real-time metrics processing
- Set up connection pooling for efficient database queries

## Phase 3: Frontend Dashboard UI (1.5 weeks)

### 3.1 Main Dashboard Page

```tsx
// frontend/app/dashboard/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AreaChart, BarChart, PieChart, MapChart } from "recharts";
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
  const socket = useSocket();
  const queryClient = useQueryClient();

  // Socket listeners for real-time updates
  useEffect(() => {
    socket?.on("analytics:update", (data: any) => {
      queryClient.invalidateQueries(["analytics"]);
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

  // Render dashboard with multiple chart types
  return (
    <div className="space-y-6">
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

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Cards */}
        <MetricCard
          title="Total Chats"
          value={1250}
          change="+12.5%"
          trend="up"
        />
        <MetricCard
          title="Avg Response Time"
          value="2.3s"
          change="-8.2%"
          trend="down"
        />
        <MetricCard
          title="Lead Conversion"
          value="18.5%"
          change="+3.2%"
          trend="up"
        />
        <MetricCard
          title="User Engagement"
          value="4.2m"
          change="+15.3%"
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Chat Volume Trends"
          type="area"
          data={chatVolumeData}
          xAxisKey="date"
          yAxisKey="count"
        />
        <ChartCard
          title="Response Time Distribution"
          type="bar"
          data={responseTimeData}
          xAxisKey="timeRange"
          yAxisKey="count"
        />
        <ChartCard
          title="Lead Conversion Funnel"
          type="funnel"
          data={conversionData}
          xAxisKey="stage"
          yAxisKey="count"
        />
        <ChartCard
          title="Geographic Distribution"
          type="map"
          data={geographicData}
        />
      </div>
    </div>
  );
}
```

### 3.2 Chart Components

```tsx
// frontend/components/analytics/ChartCard.tsx
interface ChartCardProps {
  title: string;
  type: "area" | "bar" | "line" | "pie" | "map" | "funnel";
  data: any[];
  xAxisKey?: string;
  yAxisKey?: string;
  height?: number;
}

export default function ChartCard({
  title,
  type,
  data,
  xAxisKey,
  yAxisKey,
  height = 300,
}: ChartCardProps) {
  const renderChart = () => {
    switch (type) {
      case "area":
        return <AreaChart data={data} height={height} />;
      case "bar":
        return <BarChart data={data} height={height} />;
      case "map":
        return <MapChart data={data} height={height} />;
      // Additional chart types...
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="w-full">{renderChart()}</div>
    </div>
  );
}
```

### 3.3 Metric Cards

```tsx
// frontend/components/analytics/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
}: MetricCardProps) {
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
```

## Phase 4: Advanced Features (1 week)

### 4.1 Custom Reports

```tsx
// frontend/app/dashboard/analytics/reports/page.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function ReportsPage() {
  const [reportConfig, setReportConfig] = useState({
    metrics: ["chatVolume", "responseTime", "conversionRate"],
    dimensions: ["time", "agent", "geo"],
    timeRange: "30d",
    format: "csv",
  });

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

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Generate Custom Report</h3>

        {/* Metrics Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metrics
          </label>
          <div className="space-x-2">
            {["chatVolume", "responseTime", "conversionRate", "engagement"].map(
              (metric) => (
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
              ),
            )}
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
            <option value="pdf">PDF</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => generateReport.mutate()}
          disabled={generateReport.isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generateReport.isLoading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Previous Reports */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Previous Reports</h3>
        {/* Report list will be rendered here */}
      </div>
    </div>
  );
}
```

### 4.2 Advanced Filters

```tsx
// frontend/components/analytics/Filters.tsx
interface FiltersProps {
  agentId?: string;
  timeRange?: string;
  onFilterChange: (filters: any) => void;
}

export default function Filters({
  agentId,
  timeRange,
  onFilterChange,
}: FiltersProps) {
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Agent Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agent
        </label>
        <select
          name="agentId"
          value={agentId || ""}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Agents</option>
          {/* Agent options will be populated dynamically */}
        </select>
      </div>

      {/* Other filters */}
      {/* Country, Device Type, etc. */}
    </div>
  );
}
```

## Phase 5: Performance Optimization (0.5 weeks)

### 5.1 Database Indexing

```typescript
// backend/src/agents/chat-session.schema.ts
ChatSessionSchema.index({ userId: 1, createdAt: -1 });
ChatSessionSchema.index({ userId: 1, agentId: 1, createdAt: -1 });
ChatSessionSchema.index({ userId: 1, country: 1 });
ChatSessionSchema.index({ userId: 1, convertedToLead: 1, createdAt: -1 });
```

### 5.2 Query Optimization

- Implement pagination for large datasets
- Add Redis caching for frequently accessed metrics
- Optimize aggregation queries with query hints

### 5.3 Frontend Performance

- Implement lazy loading for charts
- Add virtual scrolling for large report tables
- Optimize image loading

## Phase 6: Testing & Deployment (0.5 weeks)

### 6.1 Unit Testing

```typescript
// backend/src/analytics/analytics.service.spec.ts
describe("AnalyticsService", () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe("getChatVolumeTrends", () => {
    it("should return chat volume trends for 7-day period", async () => {
      const userId = "1234567890";
      const timeRange = "7d";

      const result = await service.getChatVolumeTrends(userId, timeRange);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(7);
    });
  });

  // Additional tests for other methods...
});
```

### 6.2 Integration Testing

- Test analytics API endpoints
- Test real-time WebSocket updates
- Test dashboard interaction flow

### 6.3 Performance Testing

- Load testing with thousands of concurrent users
- Stress testing to find breaking points
- Monitor API response times under load

## Milestones

1. **Infrastructure Complete** - Week 1
2. **Real-time System Working** - Week 2
3. **Dashboard UI Complete** - Week 3.5
4. **Advanced Features Done** - Week 4.5
5. **Testing & Deployment** - Week 5

## Success Metrics

- Analytics dashboard loads in under 2 seconds
- Real-time updates arrive within 1 second
- API endpoints respond in under 500ms
- Dashboard works on all screen sizes
- All tests pass (unit, integration, e2e)

## Risks & Mitigation

1. **Data Processing Performance**: Large datasets could cause slow queries
   - Mitigation: Implement pagination, caching, and query optimization

2. **Real-time System Scalability**: WebSocket connections could overload server
   - Mitigation: Use Redis pub/sub and horizontal scaling

3. **Geolocation Accuracy**: IP-based geolocation can be inaccurate
   - Mitigation: Use multiple geolocation APIs for cross-validation

4. **Chart Performance**: Complex charts could lag on older devices
   - Mitigation: Optimize chart rendering and implement lazy loading

## Post-Implementation Tasks

1. Monitor dashboard performance in production
2. Collect user feedback for improvements
3. Add new metrics based on user requests
4. Optimize based on real-world usage patterns

This implementation plan provides a comprehensive roadmap for building a powerful chat analytics dashboard that will help users understand and optimize their chatbot performance.
