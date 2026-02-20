import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WhatsAppChatSession,
  WhatsAppChatSessionDocument,
} from './whatsapp-chat.schema';
import { MetaWhatsAppAPI } from './meta-whatsapp-api';
import { WhatsAppAccountService } from './whatsapp-account.service';

@Injectable()
export class WhatsAppChatService {
  constructor(
    @InjectModel(WhatsAppChatSession.name)
    private chatSessionModel: Model<WhatsAppChatSessionDocument>,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
    private readonly whatsAppAccountService: WhatsAppAccountService,
  ) {}

  async getChatSessions(userId: string): Promise<WhatsAppChatSession[]> {
    return this.chatSessionModel
      .find({ userId, status: 'active' })
      .sort({ lastActive: -1 });
  }

  async getChatSessionById(
    userId: string,
    sessionId: string,
  ): Promise<WhatsAppChatSession | null> {
    return this.chatSessionModel.findOne({ _id: sessionId, userId });
  }

  async getChatSessionByFromNumber(
    userId: string,
    fromNumber: string,
  ): Promise<WhatsAppChatSession | null> {
    return this.chatSessionModel.findOne({
      userId,
      from: fromNumber,
      status: 'active',
    });
  }

  async createChatSession(
    userId: string,
    fromNumber: string,
  ): Promise<WhatsAppChatSession> {
    const sessionId = `whatsapp_${fromNumber}_${Date.now()}`;
    const chatSession = new this.chatSessionModel({
      userId,
      from: fromNumber,
      sessionId,
      messages: [],
      lastActive: new Date(),
      status: 'active',
      metadata: {},
    });

    return chatSession.save();
  }

  async addMessageToSession(
    userId: string,
    fromNumber: string,
    message: any,
  ): Promise<WhatsAppChatSession> {
    let chatSession = await this.getChatSessionByFromNumber(userId, fromNumber);

    if (!chatSession) {
      chatSession = await this.createChatSession(userId, fromNumber);
    }

    chatSession.messages.push({
      messageId: message.messageId,
      type: message.type,
      content: message.content,
      sender: message.sender,
      timestamp: new Date(),
      status: message.status,
    });

    chatSession.lastActive = new Date();
    return this.chatSessionModel.findByIdAndUpdate(
      (chatSession as any)._id,
      chatSession,
      { new: true },
    ) as any;
  }

  async handleIncomingMessage(userId: string, messageData: any): Promise<void> {
    // Add incoming message to chat session
    await this.addMessageToSession(userId, messageData.from, {
      messageId: messageData.messageId,
      type: messageData.messageType || 'text',
      content: messageData.text,
      sender: 'user',
      status: 'read',
    });

    // Send auto-reply if configured
    await this.sendAutoReply(userId, messageData.from, messageData.text);
  }

  async sendAutoReply(
    userId: string,
    toNumber: string,
    messageText: string,
  ): Promise<void> {
    const account = await this.whatsAppAccountService.getByUserId(userId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    // Simple auto-reply logic - can be enhanced with AI or templates
    const autoReply = `Thank you for your message! We'll get back to you soon. Your message: "${messageText}"`;

    try {
      const response = await this.metaWhatsAppAPI.sendMessage(
        account.phoneNumberId,
        account.accessToken,
        toNumber,
        autoReply,
      );

      // Add auto-reply to chat session
      await this.addMessageToSession(userId, toNumber, {
        messageId: response.messages[0].id,
        type: 'text',
        content: autoReply,
        sender: 'bot',
        status: 'sent',
      });
    } catch (error) {
      console.error('Failed to send auto-reply:', error.message);
    }
  }

  async sendMessage(
    userId: string,
    toNumber: string,
    message: any,
  ): Promise<void> {
    const account = await this.whatsAppAccountService.getByUserId(userId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    let response;
    if (message.type === 'template') {
      response = await this.metaWhatsAppAPI.sendTemplateMessage(
        account.phoneNumberId,
        account.accessToken,
        toNumber,
        message.templateName,
        message.languageCode,
        message.components,
      );
    } else if (message.type === 'interactive') {
      response = await this.metaWhatsAppAPI.sendInteractiveMessage(
        account.phoneNumberId,
        account.accessToken,
        toNumber,
        message.data,
      );
    } else {
      response = await this.metaWhatsAppAPI.sendMessage(
        account.phoneNumberId,
        account.accessToken,
        toNumber,
        message.content,
      );
    }

    // Add message to chat session
    await this.addMessageToSession(userId, toNumber, {
      messageId: response.messages[0].id,
      type: message.type || 'text',
      content: message.content || message.templateName,
      sender: 'bot',
      status: 'sent',
    });
  }

  async closeChatSession(
    userId: string,
    sessionId: string,
  ): Promise<WhatsAppChatSession | null> {
    return this.chatSessionModel.findByIdAndUpdate(
      sessionId,
      { status: 'closed' },
      { new: true },
    );
  }

  async getChatHistory(
    userId: string,
    sessionId: string,
  ): Promise<WhatsAppChatSession | null> {
    return this.chatSessionModel.findOne({ _id: sessionId, userId });
  }

  async getChatHistoryByNumber(
    userId: string,
    fromNumber: string,
  ): Promise<WhatsAppChatSession | null> {
    return this.chatSessionModel.findOne({ userId, from: fromNumber });
  }

  async deleteChatSession(userId: string, sessionId: string): Promise<boolean> {
    const chatSession = await this.getChatSessionById(userId, sessionId);
    if (!chatSession) {
      return false;
    }

    await this.chatSessionModel.findByIdAndDelete(sessionId);
    return true;
  }
}
