# Lead Capture System Implementation Plan

## Feature Overview

Add lead capture functionality to chat widgets with built-in lead management. Users can define custom lead forms, track interactions, and export leads.

**Business Value**: Turns chat widgets into powerful lead generation tools for digital agencies, marketers, and businesses.

**Target Users**: Digital marketing agencies, sales teams, e-commerce businesses, service providers.

## Implementation Timeline

**Total Estimated Time**: 3-4 weeks

## Phase 1: Database Design & Backend Setup (1 week)

### 1.1 Database Schema Design

```typescript
// backend/src/leads/leads.schema.ts

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Agent", required: true })
  agentId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  name?: string;

  @Prop()
  company?: string;

  @Prop()
  website?: string;

  @Prop({ type: Object, default: {} })
  customFields?: Record<string, any>;

  @Prop({ type: [{ type: Types.ObjectId, ref: "ChatSession" }], default: [] })
  chatSessions: Types.ObjectId[];

  @Prop({ default: "new" }) // new, contacted, qualified, converted, lost
  status: string;

  @Prop()
  notes?: string;

  @Prop()
  tags?: string[];
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Add indexes for performance
LeadSchema.index({ userId: 1, status: 1 });
LeadSchema.index({ userId: 1, createdAt: -1 });
```

### 1.2 Chat Session Schema Extension

```typescript
// backend/src/agents/chat-session.schema.ts (new file)

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ChatSessionDocument = ChatSession & Document;

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Agent", required: true })
  agentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Lead" })
  leadId?: Types.ObjectId;

  @Prop({ default: "active" }) // active, ended
  status: string;

  @Prop()
  visitorId?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  referringUrl?: string;

  @Prop()
  pageUrl?: string;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);
```

### 1.3 Leads Module Setup

```typescript
// backend/src/leads/leads.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    MongooseModule.forFeature([{ name: ChatSession.name, schema: ChatSessionSchema }]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}

// backend/src/leads/leads.service.ts
@Injectable()
export class LeadsService {
  // Lead CRUD operations
  // Chat session management
  // Lead status updates
  // Search and filtering
}

// backend/src/leads/leads.controller.ts
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  @Get()
  findAll(@Request() req) { ... }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) { ... }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any, @Request() req) { ... }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) { ... }

  @Post('export')
  export(@Body() exportData: any, @Request() req) { ... }
}
```

### 1.4 Extend App Module

```typescript
// backend/src/app.module.ts
@Module({
  imports: [
    // ... existing imports
    LeadsModule, // Add new Leads module
  ],
  // ...
})
export class AppModule {}
```

## Phase 2: API Development (1 week)

### 2.1 Lead Management Endpoints

```typescript
// LeadsController endpoints

// Get all leads
GET /leads
Query params: status, search, page, limit

// Get single lead
GET /leads/:id

// Update lead
PATCH /leads/:id
Body: { status, notes, tags, customFields }

// Delete lead
DELETE /leads/:id

// Export leads
POST /leads/export
Body: { format: 'csv' | 'json', filters: {} }
Response: file download

// Get lead activity
GET /leads/:id/activity
```

### 2.2 Chat Session Endpoints

```typescript
// Get chat sessions for lead
GET /leads/:id/sessions

// Get lead from chat session
GET /sessions/:id/lead
```

### 2.3 Lead Capture Configuration

```typescript
// Update agent with lead capture settings
PATCH /agents/:id/lead-capture
Body: {
  enabled: boolean,
  trigger: 'manual' | 'time' | 'messageCount',
  triggerValue: number, // seconds or message count
  formFields: [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'name', label: 'Name', type: 'text', required: false },
    { name: 'phone', label: 'Phone', type: 'phone', required: false },
    { name: 'company', label: 'Company', type: 'text', required: false }
  ]
}
```

## Phase 3: Frontend Development (1 week)

### 3.1 Leads Page Component

```typescript
// frontend/app/dashboard/leads/page.tsx
export default function LeadsPage() {
  // State for leads, filters, pagination
  // Queries for fetching leads
  // UI for leads table with search/filter

  return (
    <div className="leads-dashboard">
      {/* Search and Filter */}
      {/* Leads Table */}
      {/* Export Button */}
      {/* Pagination */}
    </div>
  );
}
```

### 3.2 Lead Detail Component

```typescript
// frontend/app/dashboard/leads/[id]/page.tsx
export default function LeadDetail({ params }) {
  // State for lead details
  // Query for fetching lead
  // UI for lead details, activity, chat history

  return (
    <div className="lead-detail">
      {/* Lead Information */}
      {/* Chat Sessions Timeline */}
      {/* Notes Section */}
      {/* Status/Tags Management */}
    </div>
  );
}
```

### 3.3 Lead Capture Configuration

```typescript
// frontend/app/dashboard/[id]/lead-capture/page.tsx
export default function LeadCaptureSettings({ params }) {
  // State for configuration form
  // Mutation for saving settings
  // UI for form builder

  return (
    <div className="lead-capture-settings">
      {/* Enable/Disable Toggle */}
      {/* Trigger Configuration */}
      {/* Form Fields Builder */}
      {/* Preview */}
    </div>
  );
}
```

### 3.4 Lead Capture Modal for Widget

```typescript
// frontend/public/widget.js (widget code)
// Add lead capture modal that triggers based on configuration
// Form validation and submission

const LeadCaptureModal = ({ agent, onSubmit }) => {
  // Form state and validation
  // UI for modal and form

  return (
    <div className="lead-capture-modal">
      <h3>Get Started</h3>
      <p>Tell us a bit about yourself to continue</p>
      <form onSubmit={onSubmit}>
        {/* Dynamic form fields */}
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};
```

## Phase 4: Integration & Testing (1 week)

### 4.1 Backend Integration

- Update AgentsService to use LeadsService for lead capture
- Modify AgentsController to handle lead capture configuration
- Add chat session tracking to chat endpoint
- Implement lead export functionality (CSV/JSON)

### 4.2 Frontend Integration

- Add leads navigation to dashboard sidebar
- Update dashboard layout with leads section
- Add lead capture settings to agent edit page
- Update widget code to include lead capture modal

### 4.3 Testing

- Unit tests for LeadsService
- Integration tests for LeadsController
- E2E tests for lead capture flow
- Widget functionality testing
- Performance testing

### 4.4 Documentation

- Update API documentation
- Add user guide for lead capture feature
- Update architecture documentation

## Phase 5: Admin Dashboard Integration (Optional)

```typescript
// frontend/app/admin/leads/page.tsx
export default function AdminLeadsPage() {
  // State for all leads across users
  // Queries for fetching leads
  // Filters for user, date range, status

  return (
    <div className="admin-leads">
      {/* Search and Filter */}
      {/* Leads Table */}
      {/* Export Button */}
      {/* Statistics */}
    </div>
  );
}
```

## Data Migration

- Existing agents need default lead capture settings (disabled)
- Existing chat sessions should be retroactively linked to leads if possible

## Performance Considerations

- Add indexes for common queries
- Implement pagination for leads list
- Use Redis caching for frequent queries
- Optimize database queries

## Security Considerations

- Lead data must be encrypted at rest
- Secure API endpoints with JWT authentication
- Validate and sanitize all inputs
- Implement rate limiting for lead capture

## Monitoring & Analytics

- Track lead capture rate per agent
- Monitor form abandonment rate
- Track lead status changes
- Add lead capture metrics to dashboard

## Future Enhancements

- Lead scoring system
- Lead assignment automation
- Email notifications for new leads
- Integration with CRM systems
- Custom lead form templates

## Final Deliverable

A complete lead capture system that:

1. Allows users to enable/disable lead capture per agent
2. Configurable trigger conditions (time, message count, manual)
3. Customizable lead form fields
4. Lead management dashboard with search/filter
5. Lead activity tracking and chat history
6. Export functionality (CSV/JSON)
7. Lead capture modal in chat widget
8. Admin dashboard for viewing all leads

The feature follows existing architectural patterns and can be implemented without breaking changes to the current system.
