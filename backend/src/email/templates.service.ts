import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailTemplate, EmailTemplateDocument } from './templates.schema';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectModel(EmailTemplate.name)
    private templateModel: Model<EmailTemplateDocument>,
  ) {}

  async createTemplate(userId: string, data: any): Promise<EmailTemplate> {
    const template = new this.templateModel({
      userId,
      ...data,
    });
    return template.save();
  }

  async getTemplates(userId: string): Promise<EmailTemplate[]> {
    return this.templateModel.find({ userId, isActive: true });
  }

  async getTemplate(
    userId: string,
    templateId: string,
  ): Promise<EmailTemplate> {
    const template = await this.templateModel.findOne({
      _id: templateId,
      userId,
    });
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }

  async updateTemplate(
    userId: string,
    templateId: string,
    data: any,
  ): Promise<EmailTemplate> {
    const updated = await this.templateModel.findByIdAndUpdate(
      templateId,
      { ...data },
      { new: true },
    );
    if (!updated) {
      throw new Error('Template not found');
    }
    return updated;
  }

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    await this.templateModel.deleteOne({ _id: templateId, userId });
  }
}
