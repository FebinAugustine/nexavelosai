# NexaVelosAI Frontend Architecture Documentation

## 1. Project Overview

NexaVelosAI is a SaaS platform that allows users to create, configure, and deploy customizable AI-powered chat agent widgets on their websites. The frontend is built with Next.js 16, providing a modern, responsive user interface with server-side rendering and real-time features.

## 2. Tech Stack

### Core Framework

- **Next.js 16**: React framework with server-side rendering and routing
- **React 19**: UI library with hooks and context API
- **TypeScript**: Type-safe development

### Key Dependencies

- **@tanstack/react-query**: Data fetching and caching
- **axios**: HTTP client for API requests
- **socket.io-client**: Real-time communication
- **react-hot-toast**: Toast notifications
- **react-markdown**: Markdown rendering
- **dompurify & jsdom**: HTML sanitization

### Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **PostCSS**: CSS transformation tool

## 3. Architecture Pattern

The frontend follows a **component-based architecture** with clear separation of concerns:

```
app/
├── auth-provider.tsx          # Authentication context
├── socket-context.tsx         # WebSocket context
├── query-provider.tsx         # React Query context
├── globals.css                # Global styles
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page
├── login/                     # Login page
├── register/                  # Registration page
├── verify/                    # Email verification page
├── forgot-password/           # Forgot password page
├── reset-password/            # Reset password page
├── dashboard/                 # User dashboard
│   ├── page.tsx               # Dashboard overview
│   ├── create-agent/          # Agent creation
│   ├── billing/               # Billing management
│   ├── billing-history/       # Payment history
│   └── profile/               # Profile settings
├── admin/                     # Admin dashboard
│   ├── layout.tsx             # Admin layout
│   ├── dashboard/             # Admin overview
│   ├── users/                 # User management
│   ├── agents/                # Agent management
│   └── invoices/              # Invoice management
├── contact/                   # Contact page
├── refund-policy/             # Refund policy page
└── hooks/
    └── useAuth.ts             # Auth hook
```

## 4. Core Features

### 4.1 Authentication & Authorization

**Auth Provider**: [`AuthProvider`](app/auth-provider.tsx)

- Manages user authentication state
- Handles JWT token storage/retrieval
- Provides `useAuth()` hook for components
- Protected route navigation

**Auth Hook**: [`useAuth`](app/hooks/useAuth.ts)

```typescript
const { user, isLoading, login, logout } = useAuth();
```

**Authentication Pages**:

- **Login**: [`login/page.tsx`](app/login/page.tsx) - Email/password login
- **Register**: [`register/page.tsx`](app/register/page.tsx) - New user registration
- **Verify**: [`verify/page.tsx`](app/verify/page.tsx) - Email verification
- **Forgot Password**: [`forgot-password/page.tsx`](app/forgot-password/page.tsx) - Password reset request
- **Reset Password**: [`reset-password/page.tsx`](app/reset-password/page.tsx) - Password reset

### 4.2 Dashboard

**Main Dashboard**: [`dashboard/page.tsx`](app/dashboard/page.tsx)

- Overview of user's agents and analytics
- Agent management (create, edit, delete, test)
- Analytics dashboard with real-time updates
- Account settings (profile, password change, delete)
- Billing management

**Key Features**:

- Real-time analytics via WebSocket
- Agent testing modal
- Agent snippet generation
- Chat with agents using queue system
- Plan upgrade/downgrade

### 4.3 Agent Management

**Create Agent**: [`dashboard/create-agent/page.tsx`](app/dashboard/create-agent/page.tsx)

- Form for creating new AI agents
- Provider selection (Gemini, ChatGPT, OpenRouter)
- API key configuration
- Domain restriction settings
- Input validation and sanitization

**Agent Operations**:

- Create agent with custom configuration
- Edit existing agents
- Delete agents
- Test agents via chat interface
- Generate embeddable JavaScript snippets

### 4.4 Admin Dashboard

**Admin Layout**: [`admin/layout.tsx`](app/admin/layout.tsx)

- Protected admin-only routes
- Sidebar navigation
- User role verification

**Admin Pages**:

- **Dashboard**: [`admin/dashboard/page.tsx`](app/admin/dashboard/page.tsx) - Overview of platform statistics
- **Users**: [`admin/users/page.tsx`](app/admin/users/page.tsx) - User management (CRUD)
- **Agents**: [`admin/agents/page.tsx`](app/admin/agents/page.tsx) - Agent management (CRUD)
- **Invoices**: [`admin/invoices/page.tsx`](app/admin/invoices/page.tsx) - Invoice management

### 4.5 Billing & Payments

**Billing Page**: [`dashboard/billing/page.tsx`](app/dashboard/billing/page.tsx)

- Current plan information
- Plan comparison
- Upgrade/downgrade functionality
- Razorpay payment integration

**Billing History**: [`dashboard/billing-history/page.tsx`](app/dashboard/billing-history/page.tsx)

- View past transactions
- Download invoices
- Payment status tracking

### 4.6 Real-Time Features

**Socket Context**: [`socket-context.tsx`](app/socket-context.tsx)

- WebSocket connection management
- Real-time event listeners
- Provides `useSocket()` hook

**Real-Time Events**:

- `analyticsUpdate`: Updates dashboard analytics
- `agent-result-{userId}`: Sends chat results from agents

## 5. Data Management

### 5.1 API Integration

**Base API Client**:

```typescript
// API endpoints (http://localhost:5000)
- /auth/*: Authentication
- /agents/*: Agent management
- /payments/*: Payment processing
- /admin/*: Admin functionality
```

**Admin API**: [`admin-api.ts`](utils/admin-api.ts)

```typescript
const adminApi = {
  getUsers: () => axios.get("/api/admin/users"),
  getUserById: (id: string) => axios.get(`/api/admin/users/${id}`),
  createUser: (userData: any) => axios.post("/api/admin/users", userData),
  updateUser: (id: string, userData: any) =>
    axios.patch(`/api/admin/users/${id}`, userData),
  deleteUser: (id: string) => axios.delete(`/api/admin/users/${id}`),
  getAgents: () => axios.get("/api/admin/agents"),
  getInvoices: () => axios.get("/api/admin/invoices"),
};
```

### 5.2 State Management

**React Query**: [`query-provider.tsx`](app/query-provider.tsx)

- Caches API responses
- Handles loading/error states
- Automatic refetching
- Query invalidation

**Key Queries**:

```typescript
// User data
useQuery(["user"], fetchUserProfile);

// Agents
useQuery(["agents"], fetchAgents);

// Analytics
useQuery(["analytics"], fetchAnalytics);

// Admin data
useQuery(["adminUsers"], fetchUsers);
useQuery(["adminAgents"], fetchAgents);
useQuery(["adminInvoices"], fetchInvoices);
```

### 5.3 Mutations

**Key Mutations**:

```typescript
// Agent operations
useMutation(deleteAgent, { onSuccess: invalidateAgents });
useMutation(updateAgent, { onSuccess: invalidateAgents });
useMutation(createAgent, { onSuccess: invalidateAgents });

// User operations
useMutation(changePassword);
useMutation(deleteAccount);
```

## 6. Security Features

### Input Validation & Sanitization

**Sanitization Functions**: [`sanitization.ts`](lib/sanitization.ts)

```typescript
const sanitizeTextInput = (input: string): string => {
  // Remove HTML tags and sanitize input
};

const sanitizeAndValidateInput = (
  input: string,
  options: ValidationOptions,
): SanitizationResult => {
  // Validate length, format, etc.
};

const isValidAgentName = (name: string): boolean => {
  // Validate agent name format
};

const isValidDomain = (domain: string): boolean => {
  // Validate domain format
};

const isValidPassword = (password: string): boolean => {
  // Validate password strength
};
```

### Authentication

- JWT token stored in localStorage
- Protected routes redirect to login
- Token validation on page load
- Automatic logout on token expiration

## 7. Performance Optimizations

### Code Splitting

- Next.js automatic code splitting
- Dynamic imports for large components

### Caching

- React Query cache for API responses
- Browser caching for static assets

### Image Optimization

- Next.js Image component for optimized images
- WebP format support

## 8. Responsive Design

### Tailwind CSS

- Mobile-first approach
- Responsive breakpoints: sm, md, lg, xl, 2xl
- Flexbox and Grid layouts
- Responsive typography

### Components

- Sidebar navigation collapses on mobile
- Modal dialogs adapt to screen size
- Forms reflow on mobile devices
- Touch-friendly controls

## 9. Error Handling

### API Error Handling

```typescript
try {
  const response = await axios.get("/api/endpoint");
  return response.data;
} catch (error: any) {
  toast.error(error.response?.data?.message || "Something went wrong");
}
```

### Global Error Handling

- React Error Boundaries for component errors
- API error toast notifications
- Loading states for async operations

## 10. User Experience

### Notifications

**Toast Notifications**: [react-hot-toast](https://react-hot-toast.com/)

```typescript
toast.success("Operation successful");
toast.error("Error message");
toast.loading("Loading...");
toast.custom("Custom notification");
```

### Loading States

- Skeleton loaders for content
- Spinners for async operations
- Progress indicators for file uploads

### Responsive Feedback

- Hover effects on interactive elements
- Button states (active, disabled, loading)
- Form validation feedback

## 11. Build & Deployment

### Build Configuration

**next.config.ts**:

```typescript
const nextConfig = {
  // Configuration options
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
```

**Scripts**:

```json
{
  "dev": "next dev", // Development server
  "build": "next build", // Production build
  "start": "next start", // Production server
  "lint": "eslint" // Linting
}
```

## 12. Project Structure Best Practices

### Folder Structure

- Pages organized by feature
- Components grouped by functionality
- Utilities and helpers in separate folders
- Context and hooks in dedicated files

### Code Organization

- Type definitions for data structures
- Component interfaces for props
- Custom hooks for shared logic
- Service files for API integration

## 13. Key Business Logic

### Agent Creation Flow

1. User navigates to create-agent page
2. Fills out agent details (name, description, API key, provider, domain)
3. Form validated and sanitized
4. API request to `/agents` endpoint
5. Success toast and redirect to dashboard

### Agent Chat Flow

1. User selects agent to test
2. Opens chat modal
3. Sends message via API
4. Receives jobId from backend
5. Listens for WebSocket event with result
6. Displays agent response

### Plan Upgrade Flow

1. User views current plan on billing page
2. Selects new plan
3. Creates order via `/payments/create-order`
4. Redirected to Razorpay payment page
5. Payment processed
6. User plan updated

## 14. Future Enhancements

- Dark mode support
- Multi-language support
- Advanced analytics with charts
- Agent template library
- Team collaboration features
- Chat history and transcripts
- Agent performance metrics
- API key encryption in UI

This architecture provides a modern, scalable frontend for the NexaVelosAI platform, with focus on user experience, performance, and maintainability.
