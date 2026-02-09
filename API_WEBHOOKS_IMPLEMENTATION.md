# API & Webhooks Integration Implementation Plan

## Feature Overview

Provide a robust API and webhook system for integrating chat data with external tools. Allow users to send chat data to their CRM, analytics tools, or custom systems.

**Business Value**: Enables ecosystem integration, automation of workflows, and custom development on top of NexaVelosAI. Critical for agencies and enterprise users who need to connect chatbot data with their existing systems.

**Target Users**: Developers, digital marketing agencies, enterprises with existing CRM/analytics tools.

## Implementation Timeline

**Total Estimated Time**: 5-6 weeks  
**Completed**: 2 weeks  
**Remaining**: 3-4 weeks

## Phase 1: API Design & Architecture (Completed ✅)

### 1.1 API Architecture Planning

- RESTful API following NestJS best practices
- Versioning strategy (v1, v2) for future compatibility
- Standardized response formats (success/error envelopes)
- Rate limiting and throttling
- API documentation using Swagger/OpenAPI

### 1.2 Data Transfer Objects (DTOs)

```typescript
// backend/src/api/dto/api-response.dto.ts
export class ApiResponse<T = any> {
  data?: T;
  message?: string;
  statusCode: number;
  timestamp: string;
}

// backend/src/api/dto/pagination.dto.ts
export class PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## Phase 2: Webhook System Design (Completed ✅)

### 2.1 Webhook Schema

```typescript
// backend/src/webhooks/webhooks.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type WebhookDocument = Webhook & Document;

export enum WebhookEventType {
  CHAT_STARTED = "chat_started",
  MESSAGE_SENT = "message_sent",
  MESSAGE_RECEIVED = "message_received",
  LEAD_CAPTURED = "lead_captured",
  CHAT_ENDED = "chat_ended",
  AGENT_CREATED = "agent_created",
  AGENT_UPDATED = "agent_updated",
  AGENT_DELETED = "agent_deleted",
}

@Schema({ timestamps: true })
export class Webhook {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({
    type: [String],
    enum: Object.values(WebhookEventType),
    required: true,
  })
  events: WebhookEventType[];

  @Prop({ default: true })
  active: boolean;

  @Prop()
  secret?: string;

  @Prop({ default: 0 })
  failureCount: number;

  @Prop()
  lastFailureAt?: Date;

  @Prop()
  lastSuccessAt?: Date;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);

WebhookSchema.index({ userId: 1 });
WebhookSchema.index({ active: 1, events: 1 });
```

### 2.2 Webhook Event Payloads

```typescript
// backend/src/webhooks/dto/webhook-payloads.dto.ts
export interface ChatStartedPayload {
  event: "chat_started";
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  ipAddress?: string;
  userAgent?: string;
  referringUrl?: string;
  pageUrl?: string;
}

export interface MessageSentPayload {
  event: "message_sent";
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  role: "user" | "agent";
  content: string;
}

export interface LeadCapturedPayload {
  event: "lead_captured";
  timestamp: string;
  leadId: string;
  agentId: string;
  visitorId: string;
  data: any; // Custom lead fields
}

// Other event payloads...
```

## Phase 3: Backend Implementation (Completed ✅)

### 3.1 Webhooks Module Setup

```typescript
// backend/src/webhooks/webhooks.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { Webhook, WebhookSchema } from "./webhooks.schema";
import { BullModule } from "@nestjs/bull";
import { WebhookProcessor } from "./webhook.processor";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
    BullModule.registerQueue({
      name: "webhooks",
    }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule {}
```

### 3.2 Webhooks Service

```typescript
// backend/src/webhooks/webhooks.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Webhook, WebhookDocument, WebhookEventType } from "./webhooks.schema";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
    @InjectQueue("webhooks") private webhookQueue: Queue,
  ) {}

  async createWebhook(
    userId: string,
    url: string,
    events: WebhookEventType[],
    secret?: string,
  ): Promise<WebhookDocument> {
    const webhook = new this.webhookModel({
      userId: new Types.ObjectId(userId),
      url,
      events,
      secret,
    });

    return webhook.save();
  }

  async getWebhooksByUser(userId: string): Promise<WebhookDocument[]> {
    return this.webhookModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async getWebhookById(id: string, userId: string): Promise<WebhookDocument> {
    const webhook = await this.webhookModel
      .findOne({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!webhook) {
      throw new NotFoundException("Webhook not found");
    }

    return webhook;
  }

  async updateWebhook(
    id: string,
    userId: string,
    updateData: Partial<Webhook>,
  ): Promise<WebhookDocument> {
    const webhook = await this.getWebhookById(id, userId);
    Object.assign(webhook, updateData);
    return webhook.save();
  }

  async deleteWebhook(id: string, userId: string): Promise<void> {
    const webhook = await this.getWebhookById(id, userId);
    await this.webhookModel.deleteOne({ _id: webhook._id }).exec();
  }

  async triggerWebhook(event: WebhookEventType, payload: any): Promise<void> {
    // Find all active webhooks that subscribe to this event
    const webhooks = await this.webhookModel
      .find({
        active: true,
        events: event,
      })
      .exec();

    for (const webhook of webhooks) {
      await this.webhookQueue.add("send-webhook", {
        webhookId: webhook._id.toString(),
        event,
        payload,
      });
    }
  }
}
```

### 3.3 Webhook Processor

```typescript
// backend/src/webhooks/webhook.processor.ts
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Webhook, WebhookDocument } from "./webhooks.schema";
import axios from "axios";
import * as crypto from "crypto";

@Processor("webhooks")
export class WebhookProcessor {
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
  ) {}

  @Process("send-webhook")
  async handleWebhook(job: Job) {
    const { webhookId, event, payload } = job.data;

    const webhook = await this.webhookModel.findById(webhookId).exec();

    if (!webhook || !webhook.active) {
      return;
    }

    try {
      const headers: any = {
        "Content-Type": "application/json",
        "X-NexaVelosAI-Event": event,
        "X-NexaVelosAI-Timestamp": new Date().toISOString(),
      };

      if (webhook.secret) {
        const signature = crypto
          .createHmac("sha256", webhook.secret)
          .update(JSON.stringify(payload))
          .digest("hex");
        headers["X-NexaVelosAI-Signature"] = signature;
      }

      await axios.post(webhook.url, payload, {
        headers,
        timeout: 10000,
      });

      webhook.failureCount = 0;
      webhook.lastSuccessAt = new Date();
    } catch (error) {
      webhook.failureCount += 1;
      webhook.lastFailureAt = new Date();

      if (webhook.failureCount >= 5) {
        webhook.active = false;
      }
    }

    await webhook.save();
  }
}
```

### 3.4 Webhooks Controller

```typescript
// backend/src/webhooks/webhooks.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { WebhookEventType } from "./webhooks.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("api/webhooks")
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async createWebhook(
    @Request() req,
    @Body() body: { url: string; events: WebhookEventType[]; secret?: string },
  ) {
    return this.webhooksService.createWebhook(
      req.user._id.toString(),
      body.url,
      body.events,
      body.secret,
    );
  }

  @Get()
  async getWebhooks(@Request() req) {
    return this.webhooksService.getWebhooksByUser(req.user._id.toString());
  }

  @Get(":id")
  async getWebhookById(@Param("id") id: string, @Request() req) {
    return this.webhooksService.getWebhookById(id, req.user._id.toString());
  }

  @Patch(":id")
  async updateWebhook(
    @Param("id") id: string,
    @Request() req,
    @Body()
    body: Partial<{
      url: string;
      events: WebhookEventType[];
      active: boolean;
      secret?: string;
    }>,
  ) {
    return this.webhooksService.updateWebhook(
      id,
      req.user._id.toString(),
      body,
    );
  }

  @Delete(":id")
  async deleteWebhook(@Param("id") id: string, @Request() req) {
    await this.webhooksService.deleteWebhook(id, req.user._id.toString());
    return { message: "Webhook deleted successfully" };
  }

  @Post(":id/test")
  async testWebhook(@Param("id") id: string, @Request() req) {
    const webhook = await this.webhooksService.getWebhookById(
      id,
      req.user._id.toString(),
    );

    await this.webhooksService.triggerWebhook(WebhookEventType.CHAT_STARTED, {
      event: WebhookEventType.CHAT_STARTED,
      timestamp: new Date().toISOString(),
      chatSessionId: "test-session-id",
      agentId: "test-agent-id",
      visitorId: "test-visitor-id",
      test: true,
    });

    return { message: "Webhook test triggered" };
  }
}
```

## Phase 4: API Endpoint Implementation (Completed ✅)

### 4.1 Agents API

```typescript
// backend/src/agents/agents.controller.ts (extended)
@Controller("api/v1/agents")
@UseGuards(JwtAuthGuard)
export class AgentsController {
  @Get()
  async getAgents(@Request() req) {
    // Existing functionality with standardized response
  }

  @Get(":id")
  async getAgentById(@Param("id") id: string, @Request() req) {
    // Existing functionality with standardized response
  }

  // Other agent endpoints...
}
```

### 4.2 Leads API

```typescript
// backend/src/leads/leads.controller.ts (extended)
@Controller("api/v1/leads")
@UseGuards(JwtAuthGuard)
export class LeadsController {
  @Get()
  async getLeads(@Request() req, @Query() query: any) {
    // Existing functionality with pagination and standardized response
  }

  @Get(":id")
  async getLeadById(@Param("id") id: string, @Request() req) {
    // Existing functionality with standardized response
  }

  // Other lead endpoints...
}
```

### 4.3 Teams API (Already Implemented)

The existing teams API will be included in the v1 API with standardized responses.

## Phase 5: Frontend Implementation (Completed ✅)

## Phase 6: Webhook Triggers & Documentation (3-4 weeks remaining) 🚀

### 6.1 Webhook Event Payloads (In Progress)

```typescript
// backend/src/webhooks/dto/webhook-payloads.dto.ts
export interface ChatStartedPayload {
  event: "chat_started";
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  ipAddress?: string;
  userAgent?: string;
  referringUrl?: string;
  pageUrl?: string;
}

export interface MessageSentPayload {
  event: "message_sent";
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  role: "user" | "agent";
  content: string;
}

export interface MessageReceivedPayload {
  event: "message_received";
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  role: "user" | "agent";
  content: string;
}

export interface ChatEndedPayload {
  event: "chat_ended";
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  duration: number; // in seconds
  messageCount: number;
}

export interface LeadCapturedPayload {
  event: "lead_captured";
  timestamp: string;
  leadId: string;
  agentId: string;
  visitorId: string;
  data: any; // Custom lead fields
}

export interface AgentCreatedPayload {
  event: "agent_created";
  timestamp: string;
  agentId: string;
  name: string;
  description?: string;
}

export interface AgentUpdatedPayload {
  event: "agent_updated";
  timestamp: string;
  agentId: string;
  name?: string;
  description?: string;
  updatedFields: string[];
}

export interface AgentDeletedPayload {
  event: "agent_deleted";
  timestamp: string;
  agentId: string;
  name: string;
}

// Union type for all payloads
export type WebhookPayload =
  | ChatStartedPayload
  | MessageSentPayload
  | MessageReceivedPayload
  | ChatEndedPayload
  | LeadCapturedPayload
  | AgentCreatedPayload
  | AgentUpdatedPayload
  | AgentDeletedPayload;
```

### 6.2 Webhook Triggers (In Progress)

- Add triggers to AgentsService for agent events
- Add triggers to LeadsService for lead and chat events
- Ensure all event types are properly triggered

### 6.3 Swagger Documentation (In Progress)

- Add Swagger decorators to all API endpoints
- Configure Swagger in main.ts
- Generate API documentation

### 6.4 Webhook Signature Verification Examples (In Progress)

- Add documentation for signature verification
- Provide code examples for Node.js, Python, and other languages

### 5.1 Webhooks Management Page

```typescript
// frontend/app/dashboard/webhooks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, TestTube, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/Button";

interface Webhook {
  _id: string;
  url: string;
  events: string[];
  active: boolean;
  failureCount: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  createdAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/webhooks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setWebhooks(data);
  };

  const handleCreateWebhook = async (webhookData: any) => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(webhookData),
    });

    if (response.ok) {
      setIsCreateModalOpen(false);
      fetchWebhooks();
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/webhooks/${webhookId}/test`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert("Webhook test triggered successfully");
    }
  };

  // Other handlers...

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Webhook
          </Button>
        </div>

        {/* Webhooks List */}
        <div className="grid gap-6">
          {webhooks.map((webhook) => (
            <div
              key={webhook._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {webhook.url}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Events: {webhook.events.join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {webhook.active ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>Failures:</span>
                  <span className={webhook.failureCount > 0 ? "text-red-600" : "text-green-600"}>
                    {webhook.failureCount}
                  </span>
                </div>
                {webhook.lastSuccessAt && (
                  <div>Last success: {new Date(webhook.lastSuccessAt).toLocaleString()}</div>
                )}
                {webhook.lastFailureAt && (
                  <div className="text-red-600">
                    Last failure: {new Date(webhook.lastFailureAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestWebhook(webhook._id)}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWebhook(webhook)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteWebhook(webhook._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {/* ... */}
      </div>
    </div>
  );
}
```

## Phase 6: Integration with Existing Features (1 week)

### 6.1 Trigger Webhooks from Existing Services

```typescript
// backend/src/agents/agents.service.ts (extended)
import { WebhooksService } from "../webhooks/webhooks.service";
import { WebhookEventType } from "../webhooks/webhooks.schema";

@Injectable()
export class AgentsService {
  constructor(
    // Existing dependencies
    private webhooksService: WebhooksService,
  ) {}

  async createAgent(data: any): Promise<AgentDocument> {
    const agent = await this.agentModel.create(data);

    // Trigger webhook
    await this.webhooksService.triggerWebhook(WebhookEventType.AGENT_CREATED, {
      event: WebhookEventType.AGENT_CREATED,
      timestamp: new Date().toISOString(),
      agentId: agent._id.toString(),
      ...agent.toObject(),
    });

    return agent;
  }

  // Other methods with webhook triggers...
}
```

### 6.2 Leads Service Integration

```typescript
// backend/src/leads/leads.service.ts (extended)
import { WebhooksService } from "../webhooks/webhooks.service";
import { WebhookEventType } from "../webhooks/webhooks.schema";

@Injectable()
export class LeadsService {
  constructor(
    // Existing dependencies
    private webhooksService: WebhooksService,
  ) {}

  async createLead(data: any): Promise<LeadDocument> {
    const lead = await this.leadModel.create(data);

    // Trigger webhook
    await this.webhooksService.triggerWebhook(WebhookEventType.LEAD_CAPTURED, {
      event: WebhookEventType.LEAD_CAPTURED,
      timestamp: new Date().toISOString(),
      leadId: lead._id.toString(),
      ...lead.toObject(),
    });

    return lead;
  }

  // Other methods with webhook triggers...
}
```

## Testing & Validation

### 7.1 Unit Tests

- Webhook service tests
- Webhook processor tests
- API endpoint tests
- Integration tests with existing features

### 7.2 Documentation

- Swagger/OpenAPI documentation
- API reference documentation
- Webhook event documentation with examples
- Tutorials for common integration scenarios

## Architecture Fit

- Follows existing NestJS controller/service pattern
- Extends existing API structure
- Uses existing authentication system
- Webhook delivery via Bull queue (existing infrastructure)
- No breaking changes to existing features

## Implementation Order

1. **Phase 1**: API Architecture Planning
2. **Phase 2**: Webhook System Design
3. **Phase 3**: Backend Implementation (Webhooks Module)
4. **Phase 4**: API Endpoint Implementation
5. **Phase 5**: Frontend Implementation
6. **Phase 6**: Integration with Existing Features
7. **Phase 7**: Testing & Validation

This approach ensures the API & Webhooks feature is implemented without breaking any existing functionalities and follows the existing architectural patterns.
