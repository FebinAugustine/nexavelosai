# Complete Webhook Feature Implementation Plan

## Current Status

The webhook feature has a strong foundation with:

- ✅ Backend infrastructure (module, controller, service, processor, schema)
- ✅ Frontend UI (webhooks management page, create/edit modal)
- ✅ API endpoints (CRUD operations)
- ✅ API v1 with standardized responses

**Missing Components:**

- ❌ Webhook triggers for all event types
- ❌ Standardized event payload DTOs
- ❌ Webhook signature verification documentation
- ❌ Swagger/OpenAPI documentation

## Implementation Plan

### Phase 1: Define Event Payload DTOs

**File: `backend/src/webhooks/dto/webhook-payloads.dto.ts`**

```typescript
// Chat events
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

// Lead events
export interface LeadCapturedPayload {
  event: "lead_captured";
  timestamp: string;
  leadId: string;
  agentId: string;
  visitorId: string;
  data: any; // Custom lead fields
}

// Agent events
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

### Phase 2: Implement Webhook Triggers

#### 2.1 Agents Service Triggers

**File: `backend/src/agents/agents.service.ts`**

Add WebhooksService injection and triggers:

```typescript
import { WebhooksService } from "../webhooks/webhooks.service";
import { WebhookEventType } from "../webhooks/webhooks.schema";

@Injectable()
export class AgentsService {
  constructor(
    // ... existing injections
    private webhooksService: WebhooksService, // Add this
  ) {}

  async create(
    createAgentDto: CreateAgentDto,
    userId: string,
  ): Promise<AgentDocument> {
    // ... existing code

    // Trigger webhook
    await this.webhooksService.triggerWebhook(WebhookEventType.AGENT_CREATED, {
      event: WebhookEventType.AGENT_CREATED,
      timestamp: new Date().toISOString(),
      agentId: savedAgent._id.toString(),
      name: savedAgent.name,
      description: savedAgent.description,
    });

    return savedAgent;
  }

  async update(
    id: string,
    updateAgentDto: any,
    userId: string,
  ): Promise<AgentDocument> {
    // ... existing code

    // Trigger webhook
    await this.webhooksService.triggerWebhook(WebhookEventType.AGENT_UPDATED, {
      event: WebhookEventType.AGENT_UPDATED,
      timestamp: new Date().toISOString(),
      agentId: agent._id.toString(),
      name: agent.name,
      description: agent.description,
      updatedFields: Object.keys(updateAgentDto),
    });

    return agent;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Get agent before deleting for webhook data
    const agent = await this.findOne(id, userId);

    // ... existing deletion code

    // Trigger webhook
    await this.webhooksService.triggerWebhook(WebhookEventType.AGENT_DELETED, {
      event: WebhookEventType.AGENT_DELETED,
      timestamp: new Date().toISOString(),
      agentId: id,
      name: agent.name,
    });
  }
}
```

#### 2.2 Leads Service Triggers

**File: `backend/src/leads/leads.service.ts`**

Add WebhooksService injection and trigger for lead captured:

```typescript
import { WebhooksService } from "../webhooks/webhooks.service";
import { WebhookEventType } from "../webhooks/webhooks.schema";

@Injectable()
export class LeadsService {
  constructor(
    // ... existing injections
    private webhooksService: WebhooksService, // Add this
  ) {}

  async createLead(data: any): Promise<LeadDocument> {
    // ... existing code

    // Trigger webhook
    await this.webhooksService.triggerWebhook(WebhookEventType.LEAD_CAPTURED, {
      event: WebhookEventType.LEAD_CAPTURED,
      timestamp: new Date().toISOString(),
      leadId: savedLead._id.toString(),
      agentId: savedLead.agentId?.toString() || "",
      visitorId: data.visitorId,
      data: {
        name: savedLead.name,
        email: savedLead.email,
        phone: savedLead.phone,
        company: savedLead.company,
        // Add other custom fields
      },
    });

    return savedLead;
  }
}
```

#### 2.3 Chat Session Triggers

**File: `backend/src/leads/leads.service.ts`** (add to existing methods)

```typescript
async createChatSession(data: any): Promise<ChatSessionDocument> {
  // ... existing code

  // Trigger webhook
  await this.webhooksService.triggerWebhook(WebhookEventType.CHAT_STARTED, {
    event: WebhookEventType.CHAT_STARTED,
    timestamp: new Date().toISOString(),
    chatSessionId: savedSession._id.toString(),
    agentId: savedSession.agentId?.toString() || '',
    visitorId: data.visitorId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    referringUrl: data.referringUrl,
    pageUrl: data.pageUrl,
  });

  return savedSession;
}

async addMessageToChatSession(
  sessionId: string,
  userId: string,
  message: { role: 'user' | 'agent'; content: string; timestamp?: Date },
): Promise<ChatSessionDocument> {
  // ... existing code

  // Trigger webhook
  await this.webhooksService.triggerWebhook(WebhookEventType.MESSAGE_SENT, {
    event: WebhookEventType.MESSAGE_SENT,
    timestamp: new Date().toISOString(),
    chatSessionId: session._id.toString(),
    agentId: session.agentId?.toString() || '',
    visitorId: session.visitorId,
    role: message.role,
    content: message.content,
  });

  return session;
}
```

### Phase 3: Add Swagger Documentation

**File: `backend/src/main.ts`**

```typescript
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("NexaVelosAI API")
    .setDescription("API documentation for NexaVelosAI platform")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // ... existing code

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
```

**Files to update with Swagger decorators:**

- `backend/src/api/v1/agents.controller.ts`
- `backend/src/api/v1/leads.controller.ts`
- `backend/src/api/v1/teams.controller.ts`
- `backend/src/webhooks/webhooks.controller.ts`

### Phase 4: Add Webhook Signature Verification Example

**File: `API_WEBHOOKS_IMPLEMENTATION.md`** (update existing file)

Add section:

````markdown
## Webhook Signature Verification

To verify webhook signatures, use the following code examples:

### Node.js/Express Example

```javascript
const crypto = require("crypto");

function verifyWebhookSignature(req, res, next) {
  const signature = req.headers["x-nexavelosai-signature"];
  const secret = process.env.WEBHOOK_SECRET; // Same secret used when creating webhook

  if (!signature) {
    return res.status(401).json({ error: "Signature missing" });
  }

  const hmac = crypto.createHmac("sha256", secret);
  const computedSignature = hmac.update(JSON.stringify(req.body)).digest("hex");

  if (computedSignature !== signature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
}

// Usage
app.post("/webhook", verifyWebhookSignature, (req, res) => {
  // Handle webhook event
  console.log("Received valid webhook:", req.body);
  res.status(200).send("OK");
});
```
````

### Python/Flask Example

```python
import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = 'your-webhook-secret'

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-NexaVelosAI-Signature')
    if not signature:
        return jsonify({'error': 'Signature missing'}), 401

    body = request.data
    computed_signature = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(computed_signature, signature):
        return jsonify({'error': 'Invalid signature'}), 401

    # Handle webhook event
    print('Received valid webhook:', request.json)
    return '', 200
```

## Verification & Validation Steps

### Test Plan

1. Create a test webhook with all events
2. Test each event type:
   - Create/Update/Delete an agent
   - Start a chat session
   - Send messages as user and agent
   - Capture a lead
   - End a chat session
3. Verify webhook deliveries
4. Test signature verification
5. Test failure handling (invalid URL, timeout)
6. Test plan-based access control

### Expected Results

- Webhooks should be triggered for all configured events
- Payloads should match the defined DTO structures
- Signatures should be valid and verifiable
- Failed deliveries should be tracked
- Only Agency plan users should have access

## Conclusion

Completing these phases will result in a fully functional webhook system that:

1. Supports all defined event types
2. Sends standardized payloads
3. Provides secure signature verification
4. Has comprehensive documentation
5. Handles failures and retries appropriately

The webhook feature will then be production-ready for integration with external systems like CRM platforms, analytics tools, and custom workflows.
