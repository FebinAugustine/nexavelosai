# NexaVelosAI Backend Architecture Documentation

## 1. Project Overview

NexaVelosAI is a SaaS platform that allows users to create, configure, and deploy customizable AI-powered chat agent widgets on their websites. The backend is built with NestJS, providing a scalable, modular architecture with support for multiple AI providers, payment processing, and real-time features.

## 2. Tech Stack

### Core Framework

- **NestJS**: Progressive Node.js framework for building efficient, reliable, and scalable server-side applications
- **TypeScript**: Type-safe development with static typing
- **MongoDB**: NoSQL database with Mongoose ORM for flexible data storage

### Key Dependencies

- **@nestjs/mongoose**: MongoDB integration
- **@nestjs/jwt & @nestjs/passport**: Authentication and authorization
- **@nestjs/bull**: Queue management for background jobs
- **@nestjs/websockets & socket.io**: Real-time communication
- **@nestjs/throttler**: Rate limiting
- **@nestjs/cache-manager**: Caching with Redis
- **razorpay**: Payment gateway integration
- **nodemailer**: Email service
- **bcrypt**: Password hashing

## 3. Architecture Pattern

The backend follows a **modular monolithic architecture** with clear separation of concerns:

```
src/
├── auth/          # Authentication & authorization
├── users/         # User management
├── agents/        # AI agent management
├── payments/      # Payment processing
├── admin/         # Admin dashboard functionality
├── events/        # WebSocket events
├── agent-queue/   # Background job processing
├── mail/          # Email service
└── app/           # Root module
```

## 4. Core Modules

### 4.1 Authentication Module (`auth/`)

**Purpose**: Handles user authentication and authorization

**Key Features**:

- User registration with email verification
- Email verification with time-limited codes
- Login with JWT token generation
- Forgot/Reset password functionality
- Profile management
- Change password
- Account deletion

**Controller**: [`AuthController`](src/auth/auth.controller.ts)

```typescript
// Main Endpoints:
POST / auth / register; // Register new user
POST / auth / verify; // Verify email
POST / auth / login; // User login
POST / auth / forgot - password; // Forgot password
POST / auth / reset - password; // Reset password
GET / auth / profile; // Get user profile (JWT protected)
PATCH / auth / profile; // Update profile (JWT protected)
PATCH / auth / change - password; // Change password (JWT protected)
DELETE / auth / account; // Delete account (JWT protected)
```

**Authentication Guards**:

- `JwtAuthGuard`: Protects routes requiring authentication
- `AdminAuthGuard`: Protects admin-only routes
- `OptionalJwtAuthGuard`: Optional authentication for public routes
- `PlanBasedThrottlerGuard`: Rate limiting based on user plan

### 4.2 Users Module (`users/`)

**Purpose**: Manages user data and profiles

**Data Model**: [`UserSchema`](src/users/users.schema.ts)

```typescript
{
  email: string;              // Unique email
  password: string;           // Hashed password
  isVerified: boolean;        // Email verification status
  verificationCode?: string;  // Verification code
  verificationCodeExpires?: Date;
  plan: string;               // free/regular/special/agency
  agentLimit: number;         // Max agents per plan
  domains: string[];          // Allowed domains
  role: string;               // user/admin
  agents: Types.ObjectId[];   // Associated agents
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}
```

### 4.3 Agents Module (`agents/`)

**Purpose**: Manages AI chat agents and their functionality

**Key Features**:

- Create, read, update, delete agents
- Chat with agents (real-time and queue-based)
- Generate embeddable JavaScript snippets
- Analytics tracking
- Plan-based restrictions

**Controller**: [`AgentsController`](src/agents/agents.controller.ts)

```typescript
// Main Endpoints:
POST /agents                 // Create new agent (JWT protected)
GET /agents                  // Get all user agents (JWT protected)
GET /agents/analytics        // Get analytics (JWT protected)
GET /agents/analytics/detailed  // Get detailed analytics (JWT protected)
GET /agents/:id              // Get single agent (JWT protected)
PATCH /agents/:id            // Update agent (JWT protected)
DELETE /agents/:id           // Delete agent (JWT protected)
GET /agents/:id/snippet      // Get embeddable snippet (JWT protected)
POST /agents/:id/chat        // Chat with agent (public/optional JWT)
```

**Data Model**: [`AgentSchema`](src/agents/agents.schema.ts)

```typescript
{
  name: string;              // Agent name
  description?: string;
  apiKey: string;            // AI provider API key
  provider: string;          // gemini/chatgpt/openrouter
  userId: Types.ObjectId;    // Owner user
  configuration: Record<string, any>;  // Agent settings
  domain?: string;           // Allowed domain
  chatCount: number;         // Chat count metric
  totalInteractions: number; // Total interactions metric
}
```

**Services**:

- `AgentsService`: Core agent management
- `PlanBasedThrottlerGuard`: Rate limiting based on plan

**Background Processing**: Uses Bull queue for chat processing

### 4.4 Payments Module (`payments/`)

**Purpose**: Handles subscription plans and payment processing

**Key Features**:

- Create Razorpay orders
- Verify payments
- Handle Razorpay webhooks
- Get billing history
- Plan management

**Controller**: [`PaymentsController`](src/payments/payments.controller.ts)

```typescript
// Main Endpoints:
POST / payments / create - order; // Create payment order (JWT protected)
POST / payments / verify - payment; // Verify payment (JWT protected)
GET / payments / history; // Get billing history (JWT protected)
POST / payments / webhook; // Razorpay webhook handler
```

**Supported Plans**:

- **Free**: $0 - Limited features
- **Regular**: $599/month - 2 agents, single domain
- **Special**: $899/month - 5 agents, 5 domains
- **Agency**: Custom pricing - Unlimited agents/domains

### 4.5 Admin Module (`admin/`)

**Purpose**: Provides admin dashboard functionality

**Key Features**:

- User management (CRUD)
- Agent management (CRUD)
- Invoice management

**Controller**: [`AdminController`](src/admin/admin.controller.ts)

```typescript
// Main Endpoints (All JWT + AdminAuthGuard protected):
GET /admin/users                  // Get all users
GET /admin/users/:id              // Get user by ID
POST /admin/users                 // Create new user
PATCH /admin/users/:id            // Update user
DELETE /admin/users/:id           // Delete user
GET /admin/agents                 // Get all agents
GET /admin/invoices               // Get all invoices
```

### 4.6 Events Module (`events/`)

**Purpose**: Handles real-time WebSocket communication

**Gateway**: [`EventsGateway`](src/events/events.gateway.ts)

```typescript
// WebSocket Events:
- analyticsUpdate: Broadcasts analytics updates
- agent-result-{userId}: Sends agent chat results
```

### 4.7 Agent Queue Module (`agent-queue/`)

**Purpose**: Manages background job processing for agent interactions

**Features**:

- Queue chat requests
- Process chat with AI providers
- Send results via WebSocket
- Handle job failures

**Processor**: [`AgentQueueProcessor`](src/agent-queue/agent-queue.processor.ts)

### 4.8 Mail Module (`mail/`)

**Purpose**: Sends emails for verification, password reset, etc.

**Service**: [`MailService`](src/mail/mail.service.ts)

- Sends verification emails
- Sends password reset emails
- Uses Nodemailer for SMTP integration

## 5. Database Architecture

### 5.1 Data Models

**Users Collection** (`users`): Stores user information, plan details, and agent associations

**Agents Collection** (`agents`): Stores agent configurations, API keys, and metrics

**Billing Collection** (`billings`): Stores payment and subscription information

### 5.2 Database Connections

- **MongoDB**: Primary database for persistent storage
- **Redis**: Caching and session management

## 6. Security Features

### Authentication & Authorization

- JWT tokens with access token rotation
- Password hashing with bcrypt
- Role-based access control (user/admin)
- Plan-based feature restrictions

### Rate Limiting

- Throttler module with default 10 requests/minute
- Plan-based throttling: Special/Agency plans have higher limits

### Data Protection

- API key encryption
- Sensitive data sanitization
- Input validation with class-validator
- Helmet middleware for security headers
- CORS configuration

## 7. Performance Optimizations

### Caching

- Redis cache for frequent queries
- 5-minute TTL for cache entries

### Background Processing

- Bull queue for chat processing
- Prevents API timeout for long-running AI requests

### Rate Limiting

- Prevents abuse and ensures fair usage

## 8. Real-Time Features

- **WebSocket Communication**: Socket.io for real-time updates
- **Analytics Broadcasting**: Live analytics updates to dashboard
- **Chat Results**: Real-time agent responses via WebSocket

## 9. Configuration

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nexavelosai

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASSWORD=password

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Server
PORT=5000
```

## 10. API Response Format

### Success Response

```typescript
{
  message: string;
  data?: any;
}
```

### Error Response

```typescript
{
  statusCode: number;
  message: string;
  error: string;
}
```

## 11. Key Business Logic

### Agent Chat Flow

1. User sends chat message to `/agents/:id/chat`
2. Request is validated and queued
3. Background worker processes the request
4. AI provider (Gemini/ChatGPT/OpenRouter) is called
5. Response is sent back via WebSocket
6. Analytics are updated

### Plan Validation

- Checks user plan before allowing agent creation
- Validates domain restrictions for agent usage
- Limits features based on subscription plan

### Payment Flow

1. User selects plan and creates order
2. Redirected to Razorpay payment page
3. Payment processed by Razorpay
4. Webhook notifies backend of payment status
5. User plan is updated

## 12. Scalability Considerations

- Modular architecture allows independent scaling
- Redis caching reduces database load
- Queue system handles traffic spikes
- Rate limiting prevents abuse

## 13. Monitoring & Analytics

- Agent chat count and interaction tracking
- User analytics dashboard
- Real-time metrics via WebSocket
- Billing history tracking

## 14. Future Enhancements

- Multi-language support
- Advanced analytics and reporting
- Additional AI provider integrations
- Team collaboration features
- Webhook integrations
- Advanced customization options

This architecture provides a solid foundation for the NexaVelosAI platform, with clear separation of concerns, robust security features, and support for scalable growth.
