export interface FlowContext {
  userId: string;
  flowId?: string;
  leadId?: string;
  email?: string;
  phone?: string;
  name?: string;
  emailContent?: string;
  emailAnalysis?: EmailAnalysisResult;
  originalEmailId?: string;
  data?: any;
}

export interface FlowExecutionResult {
  success: boolean;
  flowId: string;
  executionTime: number;
  context: FlowContext;
  result?: any;
  error?: string;
}

export interface SendEmailJobData {
  emailData: {
    to: string;
    subject: string;
    content: string;
    templateId?: string;
    variables?: Record<string, any>;
    isHtml?: boolean;
  };
  context: FlowContext;
}

export interface SendWhatsAppJobData {
  whatsappData: {
    to: string;
    templateId?: string;
    message?: string;
    variables?: Record<string, any>;
  };
  context: FlowContext;
}

export interface EmailAnalysisResult {
  intent: string;
  sentiment: string;
  keyQuestions: string[];
  nextSteps: string;
  leadQuality: string;
  rawAnalysis: string;
}
