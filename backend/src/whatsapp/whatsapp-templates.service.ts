import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WhatsAppTemplate,
  WhatsAppTemplateDocument,
} from './whatsapp-templates.schema';
import { MetaWhatsAppAPI } from './meta-whatsapp-api';
import { WhatsAppAccountService } from './whatsapp-account.service';

@Injectable()
export class WhatsAppTemplatesService {
  constructor(
    @InjectModel(WhatsAppTemplate.name)
    private templateModel: Model<WhatsAppTemplateDocument>,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
    private readonly whatsAppAccountService: WhatsAppAccountService,
  ) {}

  async getTemplates(userId: string): Promise<WhatsAppTemplate[]> {
    return this.templateModel
      .find({ userId, isDeleted: false })
      .sort({ createdAt: -1 });
  }

  async getTemplateById(
    userId: string,
    templateId: string,
  ): Promise<WhatsAppTemplate | null> {
    return this.templateModel.findOne({
      _id: templateId,
      userId,
      isDeleted: false,
    });
  }

  async createTemplate(
    userId: string,
    templateData: any,
  ): Promise<WhatsAppTemplate> {
    const account = await this.whatsAppAccountService.getByUserId(userId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    if (!account.whatsappBusinessAccountId) {
      throw new Error('WhatsApp Business Account ID not configured');
    }

    // Validate template data
    this.validateTemplate(templateData);

    // Create template in Meta WhatsApp Business API
    try {
      const response = await this.metaWhatsAppAPI.createTemplate(
        account.whatsappBusinessAccountId as string,
        account.accessToken,
        templateData,
      );

      const template = new this.templateModel({
        userId,
        templateName: templateData.name,
        languageCode: templateData.language_code || 'en_US',
        category: templateData.category || 'MARKETING',
        components: templateData.components,
        templateId: response.id,
        status: 'pending',
      });

      return template.save();
    } catch (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  async updateTemplate(
    userId: string,
    templateId: string,
    templateData: any,
  ): Promise<WhatsAppTemplate | null> {
    const existingTemplate = await this.getTemplateById(userId, templateId);
    if (!existingTemplate) {
      return null;
    }

    const account = await this.whatsAppAccountService.getByUserId(userId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    try {
      if (!existingTemplate.templateId) {
        throw new Error('Template ID not configured');
      }

      await this.metaWhatsAppAPI.updateTemplate(
        existingTemplate.templateId as string,
        account.accessToken,
        templateData,
      );

      return this.templateModel.findByIdAndUpdate(
        templateId,
        {
          ...templateData,
          status: 'pending',
          rejectionReason: undefined,
        },
        { new: true },
      );
    } catch (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }
  }

  async deleteTemplate(userId: string, templateId: string): Promise<boolean> {
    const template = await this.getTemplateById(userId, templateId);
    if (!template) {
      return false;
    }

    const account = await this.whatsAppAccountService.getByUserId(userId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    if (!account.whatsappBusinessAccountId || !template.templateId) {
      throw new Error('Required fields not configured');
    }

    try {
      await this.metaWhatsAppAPI.deleteTemplate(
        account.whatsappBusinessAccountId as string,
        account.accessToken,
        template.templateName,
        template.templateId as string,
      );

      await this.templateModel.findByIdAndUpdate(templateId, {
        isDeleted: true,
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  async validateTemplate(templateData: any): Promise<void> {
    if (!templateData.name) {
      throw new Error('Template name is required');
    }

    if (!templateData.components || templateData.components.length === 0) {
      throw new Error('Template must have at least one component');
    }

    if (
      !['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(
        templateData.category,
      )
    ) {
      throw new Error('Invalid template category');
    }
  }

  async syncTemplates(userId: string): Promise<WhatsAppTemplate[]> {
    const account = await this.whatsAppAccountService.getByUserId(userId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    if (!account.whatsappBusinessAccountId) {
      throw new Error('WhatsApp Business Account ID not configured');
    }

    try {
      const templates = await this.metaWhatsAppAPI.getTemplates(
        account.whatsappBusinessAccountId as string,
        account.accessToken,
      );

      // Sync templates with database
      const syncedTemplates: any[] = [];
      for (const template of templates) {
        const existing = await this.templateModel.findOne({
          userId,
          templateId: template.id,
        });

        if (existing) {
          // Update existing template
          existing.templateName = template.name;
          existing.languageCode = template.language.code;
          existing.category = template.category;
          existing.components = template.components;
          existing.status = template.status;
          existing.rejectionReason = template.rejection_reason;
          existing.lastApprovedAt = template.last_approved_at;
          await existing.save();
          syncedTemplates.push(existing);
        } else {
          // Create new template
          const newTemplate = new this.templateModel({
            userId,
            templateName: template.name,
            languageCode: template.language.code,
            category: template.category,
            components: template.components,
            status: template.status,
            templateId: template.id,
            rejectionReason: template.rejection_reason,
            lastApprovedAt: template.last_approved_at,
          });
          await newTemplate.save();
          syncedTemplates.push(newTemplate);
        }
      }

      return syncedTemplates;
    } catch (error) {
      throw new Error(`Failed to sync templates: ${error.message}`);
    }
  }
}
