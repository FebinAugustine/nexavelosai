# Product Requirements Document (PRD) - NexaVelosAI

## 1. Introduction

### 1.1 Project Overview

NexaVelosAI is a Software-as-a-Service (SaaS) platform designed to empower users to create, configure, and deploy customizable AI-powered chat agent widgets on their websites. The platform allows registered users to integrate their own API keys from leading AI providers such as Google Gemini, OpenAI ChatGPT, or OpenRouter, enabling personalized AI interactions. Users can generate embeddable JavaScript snippets for seamless integration, monitor analytics, and manage subscription plans tailored to their needs.

### 1.2 Objectives

- Deliver a secure, scalable SaaS solution for AI chat agent creation and management.
- Provide an intuitive user interface for non-technical users to configure and deploy AI widgets.
- Ensure robust authentication, payment processing, and data security.
- Support multiple AI providers to offer flexibility and choice.
- Enable users to track performance through comprehensive analytics.
- Facilitate plan-based access to features, promoting monetization.

### 1.3 Target Audience

- **Individual Website Owners**: Small business owners or bloggers seeking to enhance user engagement with AI chat features.
- **Agencies and Enterprises**: Marketing agencies or larger organizations requiring multiple agents across various domains.
- **Developers and Tech Enthusiasts**: Users comfortable with API integrations who want customized AI solutions.

### 1.4 Scope

This PRD covers the core features for the initial release, including user authentication, AI agent management, plan subscriptions, and basic analytics. Future enhancements may include advanced AI integrations, real-time collaboration, and expanded analytics.

## 2. Features

### 2.1 User Authentication and Account Management

- **Registration**: Users can sign up with email and password. Upon registration, a verification code is sent via email, requiring confirmation to activate the account.
- **Email Verification**: Mandatory verification process to prevent unauthorized access.
- **Login**: Secure login with email and password. Unverified users receive a toast notification prompting verification.
- **Forgot Password**: Users can request a password reset link/code sent to their email.
- **Profile Management**: Logged-in users can update personal information, view account details, and manage settings.
- **JWT Authentication**: Implement access and refresh token rotation for secure session management.

### 2.2 Dashboard and Analytics

- **User Dashboard**: A centralized hub displaying an overview of created AI agents, usage statistics, and plan details.
- **Analytics**: Track metrics such as chat interactions, user engagement, and agent performance (e.g., response times, conversation counts).
- **Agent Overview**: List all created agents with options to view, edit, or delete.

### 2.3 AI Agent Creation and Management

- **Agent Creation**: Users can create new AI agents by providing a name, description, and API key for supported providers (Gemini, ChatGPT, OpenRouter).
- **Configuration**: Customize agent behavior, such as prompt templates, response styles, and domain restrictions.
- **JS Snippet Generation**: Upon creation, generate a unique JavaScript code snippet for embedding the widget on websites.
- **Edit and Delete**: Modify existing agents or remove them as needed.
- **Access Control**: Agents can only be created or managed by logged-in users with an active plan.

### 2.4 Subscription Plans and Billing

- **Plan Tiers**:
  - **Plan 1 - Regular**: $599/month - Allows creation of up to 2 AI agents for a single domain.
  - **Plan 2 - Special**: $899/month - Allows creation of up to 5 AI agents across 5 different domains.
  - **Plan 3 - Agency**: Contact for pricing - Enables unlimited agents across multiple domains, tailored for agencies.
- **Billing Integration**: Use Razorpay for secure payment processing, supporting subscriptions and one-time payments.
- **Plan Management**: Users can view current plans, upgrade/downgrade, and manage billing history.
- **Restrictions**: Agent creation is gated by active plan status.

### 2.5 Additional Features

- **Home Page**: Professional landing page highlighting platform benefits, features, and call-to-actions for registration.
- **Toast Notifications**: Inform users of actions, errors, or requirements (e.g., verification needed).
- **Responsive Design**: Ensure all pages are mobile-friendly using Tailwind CSS.

## 3. User Stories

### 3.1 Authentication

- As a new user, I want to register an account so I can access the platform.
- As a new user, I want to verify my email with a code so I can log in securely.
- As a user, I want to log in with my credentials so I can access my dashboard.
- As a user, I want to reset my password via email so I can regain access if forgotten.
- As an unverified user, I want to see a notification prompting verification so I know what to do.

### 3.2 Dashboard and Management

- As a logged-in user, I want to view my dashboard so I can see my agents and analytics.
- As a user, I want to create a new AI agent so I can deploy it on my website.
- As a user, I want to edit my agent's configuration so I can update its behavior.
- As a user, I want to delete an agent so I can remove unused ones.
- As a user, I want to view analytics for my agents so I can monitor performance.

### 3.3 Plans and Billing

- As a user, I want to view available plans so I can choose one that fits my needs.
- As a user, I want to purchase a plan via Razorpay so I can create agents.
- As a user, I want to manage my subscription so I can upgrade or cancel.

### 3.4 General

- As a visitor, I want to view the home page so I can learn about the platform.
- As a logged-in user, I want to update my profile so I can keep my information current.

## 4. Technical Requirements

### 4.1 Frontend

- **Framework**: Next.js for server-side rendering and routing.
- **Styling**: Tailwind CSS for responsive, utility-first design.
- **State Management**: React hooks and context for client-side state.
- **Forms and Validation**: Implement form handling with validation for user inputs.
- **API Integration**: Axios or Fetch for backend communication.
- **Security**: Implement CSRF protection and secure handling of sensitive data.

### 4.2 Backend

- **Framework**: NestJS for modular, scalable architecture.
- **Database**: MongoDB for flexible data storage.
- **Authentication**: JWT with access and refresh token rotation.
- **Email Service**: Nodemailer for sending verification and reset emails.
- **Queue Management**: BullMQ for handling background jobs (e.g., email sending).
- **Caching**: Redis/ioredis for performance optimization and session storage.
- **Rate Limiting**: Implement to prevent abuse.
- **Real-time Features**: Socket.io for potential real-time updates (e.g., live analytics).
- **Security**: Comprehensive measures including CSRF, XSS, SQL injection prevention, and secure API key storage.

### 4.3 Integrations

- **AI Providers**: Support for Gemini, ChatGPT, and OpenRouter APIs.
- **Payment Gateway**: Razorpay for subscription management.
- **Email**: SMTP configuration for nodemailer.

### 4.4 Performance and Scalability

- Optimize for high concurrency with rate limiting and caching.
- Ensure responsive UI with lazy loading and efficient rendering.

## 5. Non-Functional Requirements

- **Security**: Encrypt sensitive data (e.g., API keys, passwords). Comply with data protection standards.
- **Usability**: Intuitive UI/UX with clear navigation and feedback.
- **Performance**: Page load times under 2 seconds; handle up to 1000 concurrent users.
- **Reliability**: 99.9% uptime; robust error handling and logging.
- **Scalability**: Modular architecture to support future feature additions.
- **Accessibility**: WCAG 2.1 compliance for inclusive design.

## 6. Assumptions

- Users will provide valid API keys for AI providers and handle their own API usage limits.
- Email delivery is reliable through configured SMTP.
- Razorpay integration will be set up with necessary credentials.
- Initial user base will not exceed anticipated load for MVP.

## 7. Constraints

- Development must adhere to the specified tech stack.
- Plans are fixed as described; custom pricing for Agency plan requires manual handling.
- Real-time features (e.g., Socket.io) are optional and implemented only if beneficial.
- Project timeline assumes standard development cycles without external dependencies.

## 8. Risks and Mitigations

- **API Key Security**: Risk of exposure. Mitigation: Encrypt keys in database and use secure transmission.
- **Payment Failures**: Risk of transaction issues. Mitigation: Implement retry logic and user notifications.
- **Scalability**: Risk of performance degradation. Mitigation: Use caching and optimize queries.

## 9. Acceptance Criteria

- All user stories implemented and tested.
- End-to-end testing for authentication, agent creation, and payments.
- Code reviewed and compliant with security standards.
- Documentation for API endpoints and deployment.

This PRD serves as the foundation for development. Any changes should be reviewed and approved by stakeholders.
