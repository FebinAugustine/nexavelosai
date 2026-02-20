import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MetaWhatsAppAPI {
  private readonly apiBaseUrl = 'https://graph.facebook.com/v20.0';

  constructor() {}

  async sendTemplateMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    templateName: string,
    languageCode: string,
    components: any[],
  ): Promise<any> {
    const response = await axios.post(
      `${this.apiBaseUrl}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }

  async sendMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    body: string,
    options?: { repliedToMessageWamid?: string },
  ): Promise<any> {
    const dataToProcess: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: true,
        body: body,
      },
    };

    if (options?.repliedToMessageWamid) {
      dataToProcess.context = {
        message_id: options.repliedToMessageWamid,
      };
    }

    const response = await axios.post(
      `${this.apiBaseUrl}/${phoneNumberId}/messages`,
      dataToProcess,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }

  async sendInteractiveMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    messageData: any,
  ): Promise<any> {
    const interactiveData: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: messageData.interactive_type,
      interactive: {},
    };

    if (messageData.header_type && messageData.header_type !== 'text') {
      interactiveData.interactive.header = {
        type: messageData.header_type,
        [messageData.header_type]: {
          link: messageData.media_link,
        },
      };
    } else if (messageData.header_type && messageData.header_type === 'text') {
      interactiveData.interactive.header = {
        type: 'text',
        text: messageData.header_text,
      };
    }

    if (messageData.body_text) {
      interactiveData.interactive.body = {
        text: messageData.body_text,
      };
    }

    if (messageData.footer_text) {
      interactiveData.interactive.footer = {
        text: messageData.footer_text,
      };
    }

    if (messageData.interactive_type === 'list') {
      const sections = messageData.list_data.sections.map(
        (section: any, index: number) => ({
          title: section.title,
          rows: section.rows.map((row: any) => ({
            id: row.row_id,
            title: row.title,
            description: row.description,
          })),
        }),
      );

      interactiveData.interactive.action = {
        button: messageData.list_data.button_text,
        sections: sections,
      };
    } else if (messageData.interactive_type === 'button') {
      const buttons = messageData.buttons.map(
        (button: string, index: number) => ({
          type: 'reply',
          reply: {
            id: `button-id${index + 1}`,
            title: button,
          },
        }),
      );

      interactiveData.interactive.action = {
        buttons: buttons,
      };
    }

    const response = await axios.post(
      `${this.apiBaseUrl}/${phoneNumberId}/messages`,
      interactiveData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }

  async getTemplates(
    businessAccountId: string,
    accessToken: string,
  ): Promise<any[]> {
    const response = await axios.get(
      `${this.apiBaseUrl}/${businessAccountId}/message_templates`,
      {
        params: {
          limit: 500,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data.data;
  }

  async createTemplate(
    businessAccountId: string,
    accessToken: string,
    templateData: any,
  ): Promise<any> {
    const response = await axios.post(
      `${this.apiBaseUrl}/${businessAccountId}/message_templates`,
      templateData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }

  async updateTemplate(
    templateId: string,
    accessToken: string,
    templateData: any,
  ): Promise<any> {
    const response = await axios.post(
      `${this.apiBaseUrl}/${templateId}`,
      templateData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }

  async deleteTemplate(
    businessAccountId: string,
    accessToken: string,
    templateName: string,
    templateId: string,
  ): Promise<any> {
    const response = await axios.delete(
      `${this.apiBaseUrl}/${businessAccountId}/message_templates`,
      {
        params: {
          name: templateName,
          hsm_id: templateId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  async verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
  ): Promise<string> {
    return challenge;
  }

  async parseWebhookEvent(event: any): Promise<any> {
    const entries = event.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === 'messages') {
          return this.handleMessageEvent(change.value);
        }
        if (change.field === 'statuses') {
          return this.handleStatusEvent(change.value);
        }
      }
    }
    return null;
  }

  private handleMessageEvent(value: any): any {
    const messages = value.messages || [];
    if (messages.length > 0) {
      return {
        eventType: 'message',
        messageId: messages[0].id,
        from: messages[0].from,
        timestamp: messages[0].timestamp,
        text: messages[0].text?.body,
        messageType: messages[0].type,
      };
    }
    return null;
  }

  private handleStatusEvent(value: any): any {
    const statuses = value.statuses || [];
    if (statuses.length > 0) {
      return {
        type: 'status',
        messageId: statuses[0].id,
        status: statuses[0].status,
        timestamp: statuses[0].timestamp,
      };
    }
    return null;
  }
}
