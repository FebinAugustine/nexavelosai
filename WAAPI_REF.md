# WAAPI - WhatsApp Automation Software Reference

## Overview

WAAPI is a comprehensive WhatsApp automation software built with Laravel 10, featuring both user and admin dashboards. It provides businesses with tools to manage WhatsApp campaigns, templates, contacts, and chat automation through the WhatsApp Business API.

## Technology Stack

- **Backend**: Laravel 10 (PHP 8.1+)
- **Frontend**: HTML, CSS, JavaScript (with Blade templates)
- **Database**: MySQL
- **WhatsApp API**: Meta WhatsApp Business Cloud API (v20.0)
- **Queue Management**: Laravel Queues
- **Broadcast**: Pusher
- **Encryption**: Native PHP encryption for sensitive data

## Project Structure

```
waapi/
├── app/Yantrana/Components/WhatsAppService/
│   ├── WhatsAppServiceEngine.php       # Core business logic
│   ├── WhatsAppTemplateEngine.php      # Template management
│   ├── Controllers/
│   │   ├── WhatsAppServiceController.php  # API endpoints
│   │   └── WhatsAppTemplateController.php # Template endpoints
│   ├── Services/
│   │   ├── WhatsAppApiService.php      # WhatsApp API integration
│   │   ├── WhatsAppConnectApiService.php # Connection management
│   │   └── OpenAiService.php          # AI integration
│   ├── Models/
│   │   ├── WhatsAppMessageLogModel.php # Message logs
│   │   ├── WhatsAppMessageQueueModel.php # Message queue
│   │   └── WhatsAppTemplateModel.php  # Templates
│   └── Repositories/                  # Database operations
├── database/
│   └── migrations/                    # Database schema
├── public/                            # Static assets
└── resources/views/whatsapp/          # Blade templates
```

## Core Components

### 1. WhatsAppServiceEngine.php

**File**: `waapi/app/Yantrana/Components/WhatsAppService/WhatsAppServiceEngine.php`

**Key Responsibilities**:

- Main engine for WhatsApp service functionality
- Contact management and validation
- Campaign creation and scheduling
- Message sending and queuing
- Webhook handling for message status updates
- Bot reply management
- Analytics and reporting

**Key Methods**:

- `sendMessageData()` - Get contact and template data for messaging
- `campaignRequiredData()` - Get templates and contact groups for campaigns
- `processTemplateChange()` - Handle template selection
- `prepareTemplate()` - Parse and prepare template data
- `processSendMessageForContact()` - Send message to single contact
- `processScheduleCampaign()` - Schedule campaign for future sending
- `processWebhook()` - Handle incoming webhook events

### 2. WhatsAppApiService.php

**File**: `waapi/app/Yantrana/Components/WhatsAppService/Services/WhatsAppApiService.php`

**API Integration Layer**:

- Direct interface with Meta WhatsApp Business Cloud API
- Handles all API requests and responses

**Key Methods**:

- `getTemplates()` - Fetch all templates from WhatsApp API
- `getTemplate()` - Get specific template details
- `createTemplate()` - Create new message template
- `updateTemplate()` - Update existing template
- `deleteTemplate()` - Delete template
- `sendTemplateMessage()` - Send template message
- `sendTemplateMessageViaPool()` - Send messages in batch
- `sendMessage()` - Send free-form message
- `sendInteractiveMessage()` - Send interactive messages (buttons, lists)
- `uploadResumableMedia()` - Upload media files

### 3. WhatsAppTemplateEngine.php

**File**: `waapi/app/Yantrana/Components/WhatsAppService/WhatsAppTemplateEngine.php`

**Template Management**:

- CRUD operations for WhatsApp message templates
- Template synchronization with WhatsApp API
- Template approval status tracking

**Key Methods**:

- `prepareTemplatesDataTableSource()` - Prepare data for templates datatable
- `prepareUpdateTemplateData()` - Get template data for editing
- `createOrUpdateTemplate()` - Create or update template
- `processSyncTemplates()` - Sync templates with WhatsApp API
- `processDeleteTemplate()` - Delete template

### 4. Database Models

**WhatsAppMessageLogModel.php**: Tracks all sent and received messages

- Message status (sent, delivered, read, failed)
- Contact and campaign association
- Webhook responses
- Error tracking

**WhatsAppMessageQueueModel.php**: Manages message queue

- Scheduled messages
- Campaign messages
- Failed messages for retry

**WhatsAppTemplateModel.php**: Stores message templates

- Template details (name, language, category, status)
- Template components (header, body, buttons)
- WhatsApp API template ID

## Database Schema

### Key Tables

1. **whatsapp_templates** - Message templates
2. **whatsapp_message_logs** - Message history and status
3. **whatsapp_message_queue** - Queued messages
4. **campaigns** - Campaign information
5. **campaign_groups** - Campaign contact groups
6. **contacts** - Contact information
7. **contact_groups** - Contact groups
8. **bot_replies** - Auto-reply configurations
9. **bot_flows** - Chatbot flow configurations
10. **activity_logs** - User activity tracking

## User Dashboard Features

### 1. WhatsApp Account Setup

**Connection Methods**:

- Manual configuration: Enter phoneNumberId, access token, business account ID
- Embedded signup (Facebook OAuth) for simplified setup
- Connection validation and status checking

**Settings**:

- WhatsApp Business Account configuration
- API credentials management
- Webhook setup for real-time updates

### 2. Contact Management

**Features**:

- Add contacts manually
- Import contacts from CSV files
- Create and manage contact groups
- Contact labeling and segmentation
- WhatsApp opt-in management
- Contact validation and phone number formatting

### 3. Template Management

**Template Creation**:

- Support for multiple template types:
  - Text templates
  - Media templates (images, videos, documents)
  - Location templates
  - Quick reply templates
  - Dynamic URL templates
  - Copy code templates

**Template Components**:

- Header (text, image, video, document, location)
- Body text with variables ({{1}}, {{2}}, etc.)
- Footer text
- Buttons (quick reply, phone number, URL, dynamic URL, copy code)

**Approval Process**:

- Template submission to WhatsApp
- Approval status tracking (PENDING, APPROVED, REJECTED)
- Rejection reason display
- Template synchronization with WhatsApp API

### 4. Campaign Management

**Campaign Types**:

- **Single Contact Message**: Send template message to individual contact
- **Bulk Campaign**: Send to multiple contacts or contact groups
- **Scheduled Campaign**: Schedule for future delivery
- **Recurring Campaign**: Repeating campaigns (daily, weekly, monthly)

**Campaign Features**:

- Contact selection (individual or groups)
- Template selection and customization
- Schedule configuration
- Campaign status tracking
- Message personalization with contact variables
- Campaign analytics and reporting

### 5. Messaging Features

**Types of Messages**:

- **Template Messages**: Pre-approved WhatsApp templates
- **Free-form Messages**: Conversational messages (after user reply)
- **Interactive Messages**:
  - Button messages (quick replies)
  - List messages (with sections)
  - Media messages (images, videos, documents)
  - Location messages

**Message Queue**:

- Queue management for bulk sending
- Rate limiting to comply with WhatsApp policies
- Failed message retry mechanism
- Message status tracking (sent → delivered → read)

### 6. Chat Automation

**Auto-Reply System**:

- **Bot Replies**: Set up automatic responses based on keywords
- **Trigger Types**:
  - Contains (keyword in message)
  - Is (exact match)
- **Reply Types**:
  - Text messages
  - Template messages
  - Media messages
- **Priority System**: Manage conflicting triggers

**Chatbot Flows**:

- Visual flow builder for complex chat sequences
- Start triggers (keywords, time-based, event-based)
- Flow nodes (messages, conditions, actions)
- User journey mapping

### 7. Analytics & Reporting

**Message Analytics**:

- Sent vs delivered vs read rates
- Failed message analysis
- Response time tracking
- Message type distribution

**Campaign Reports**:

- Campaign performance metrics
- Contact engagement
- Conversion tracking (link clicks, etc.)
- Campaign comparison

**Contact Insights**:

- Active vs inactive contacts
- Opt-in/opt-out rates
- Message preferences
- Response patterns

### 8. AI Integration

**Features**:

- AI-powered chat bot
- Smart reply suggestions
- Message template generation
- Language detection and translation
- Sentiment analysis

## Admin Dashboard Features

### 1. Vendor Management

**User Accounts**:

- Create and manage vendor accounts
- Vendor profile management
- Account activation/deactivation
- Role-based access control (RBAC)

**Subscription Management**:

- Plan management (free, standard, premium)
- Subscription billing
- Usage limits and quotas
- Payment gateway integration (Stripe, PayPal, Razorpay, UPI)

### 2. Platform Configuration

**Settings**:

- WhatsApp API configuration
- Email settings (SMTP, Mailgun, SparkPost)
- SMS settings
- Payment gateway settings
- System notifications

**Appearance Customization**:

- Logo and branding
- Color schemes
- Background images
- Custom CSS

### 3. Campaign Monitoring

**Admin-Level Analytics**:

- Overall platform usage
- Campaign performance across vendors
- Message volume statistics
- System health monitoring

**Vendor Analytics**:

- Individual vendor reports
- Usage patterns
- Compliance monitoring
- Performance benchmarks

### 4. System Management

**Database Management**:

- Backup and restore
- Data export
- Performance optimization

**Security**:

- API key management
- Webhook security
- IP whitelisting
- Audit logging

**Queue Management**:

- Queue monitoring
- Failed job handling
- Performance optimization

## API & Webhooks

### API Endpoints

**WhatsApp Service API**:

- `/api/whatsapp/send-message` - Send template message
- `/api/whatsapp/campaign/schedule` - Schedule campaign
- `/api/whatsapp/templates` - Get templates
- `/api/whatsapp/templates/create` - Create template
- `/api/whatsapp/webhook` - Webhook for status updates

**Contact API**:

- `/api/contacts` - Get contacts
- `/api/contacts/groups` - Get contact groups
- `/api/contacts/import` - Import contacts

### Webhook Events

**Message Status Events**:

- `messages` - Incoming messages
- `statuses` - Message status updates
- `errors` - Error events

**Event Data**:

- Message ID
- From (sender)
- To (recipient)
- Timestamp
- Status (sent, delivered, read, failed)
- Error details

## WhatsApp Business API Integration

### API Configuration

**Required Credentials**:

- Phone Number ID
- WhatsApp Business Account ID
- System User Access Token
- Webhook verify token
- App secret (for webhook security)

### Rate Limiting

**WhatsApp Policy Compliance**:

- Message sending limits per phone number
- Rate limiting per vendor
- Queue management to prevent policy violations
- Retry mechanisms for failed messages

### Template Requirements

**Approval Guidelines**:

- Templates must comply with WhatsApp policies
- No promotional content in templates without proper categorization
- Variables must be used appropriately
- Examples required for variable fields

## Security Features

### Data Encryption

- API credentials encrypted in database
- Webhook data validation
- Password hashing with bcrypt
- CSRF protection
- XSS protection

### Access Control

- Role-based permissions
- Vendor isolation
- API rate limiting
- IP whitelisting

## Performance Optimization

### Queue System

- Laravel queues for message sending
- Background job processing
- Failed job handling
- Retry mechanisms

### Caching

- Template caching
- Contact caching
- API response caching
- Redis integration

### Database Optimization

- Indexing on frequently queried fields
- Query optimization
- Connection pooling

## Deployment Architecture

### Server Requirements

- PHP 8.1+
- MySQL 5.7+
- Redis (for caching and queues)
- NGINX or Apache
- SSL certificate (required for webhooks)

### Environment Configuration

**Laravel Environment Variables**:

- `APP_ENV` - Environment (production/development)
- `APP_DEBUG` - Debug mode
- `DB_*` - Database configuration
- `MAIL_*` - Mail settings
- `PUSHER_*` - Broadcast configuration
- `QUEUE_CONNECTION` - Queue driver

## Compliance & Policies

### WhatsApp Business Platform Policies

**Key Compliance Areas**:

- Message content guidelines
- Template approval process
- Opt-in requirements
- Privacy and data protection
- Anti-spam policies

### Data Protection

- GDPR compliance
- Data retention policies
- User consent management
- Data export and deletion

## Conclusion

WAAPI is a comprehensive WhatsApp automation solution that provides businesses with powerful tools to manage their WhatsApp communication. From template management and campaign automation to chatbot flows and analytics, it covers all aspects of WhatsApp marketing and customer engagement. The architecture ensures scalability, security, and compliance with WhatsApp policies, making it suitable for businesses of all sizes.
