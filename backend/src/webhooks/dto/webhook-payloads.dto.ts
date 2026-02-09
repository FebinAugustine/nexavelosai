// Chat events
export interface ChatStartedPayload {
  event: 'chat_started';
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
  event: 'message_sent';
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  role: 'user' | 'agent';
  content: string;
}

export interface MessageReceivedPayload {
  event: 'message_received';
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  role: 'user' | 'agent';
  content: string;
}

export interface ChatEndedPayload {
  event: 'chat_ended';
  timestamp: string;
  chatSessionId: string;
  agentId: string;
  visitorId: string;
  duration: number; // in seconds
  messageCount: number;
}

// Lead events
export interface LeadCapturedPayload {
  event: 'lead_captured';
  timestamp: string;
  leadId: string;
  agentId: string;
  visitorId: string;
  data: any; // Custom lead fields
}

// Agent events
export interface AgentCreatedPayload {
  event: 'agent_created';
  timestamp: string;
  agentId: string;
  name: string;
  description?: string;
}

export interface AgentUpdatedPayload {
  event: 'agent_updated';
  timestamp: string;
  agentId: string;
  name?: string;
  description?: string;
  updatedFields: string[];
}

export interface AgentDeletedPayload {
  event: 'agent_deleted';
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
