import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WhatsAppAccount,
  WhatsAppAccountDocument,
} from './whatsapp-account.schema';
import { MetaWhatsAppAPI } from './meta-whatsapp-api';
import axios from 'axios';

@Injectable()
export class WhatsAppAccountService {
  constructor(
    @InjectModel(WhatsAppAccount.name)
    private accountModel: Model<WhatsAppAccountDocument>,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
  ) {}

  async connectAccount(userId: string, data: any): Promise<WhatsAppAccount> {
    const existing = await this.accountModel.findOne({ userId });
    if (existing) {
      return this.accountModel.findByIdAndUpdate(
        existing._id,
        {
          phoneNumber: data.phoneNumber,
          phoneNumberId: data.phoneNumberId,
          accessToken: data.accessToken,
          businessName: data.businessName,
          whatsappBusinessAccountId: data.whatsappBusinessAccountId,
          isActive: true,
          webhookUrl: data.webhookUrl,
          webhookVerifyToken: data.webhookVerifyToken,
        },
        { new: true },
      ) as any;
    }

    const newAccount = new this.accountModel({
      userId,
      phoneNumber: data.phoneNumber,
      phoneNumberId: data.phoneNumberId,
      accessToken: data.accessToken,
      businessName: data.businessName,
      whatsappBusinessAccountId: data.whatsappBusinessAccountId,
      isActive: true,
      webhookUrl: data.webhookUrl,
      webhookVerifyToken: data.webhookVerifyToken,
    });
    return newAccount.save();
  }

  async disconnectAccount(userId: string): Promise<void> {
    await this.accountModel.updateOne({ userId }, { isActive: false });
  }

  async getByUserId(userId: string): Promise<WhatsAppAccount | null> {
    return this.accountModel.findOne({ userId, isActive: true });
  }

  async validateAccount(
    userId: string,
  ): Promise<{ isValid: boolean; message: string }> {
    const account = await this.getByUserId(userId);
    if (!account) {
      return { isValid: false, message: 'Account not found' };
    }

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/${account.phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
          },
        },
      );

      if (response.status === 200) {
        return { isValid: true, message: 'Account is valid' };
      } else {
        return { isValid: false, message: 'Invalid account credentials' };
      }
    } catch (error) {
      return { isValid: false, message: error.message };
    }
  }

  async getAccountsByUserId(userId: string): Promise<WhatsAppAccount[]> {
    return this.accountModel.find({ userId });
  }

  async updateAccount(
    userId: string,
    data: any,
  ): Promise<WhatsAppAccount | null> {
    return this.accountModel.findOneAndUpdate(
      { userId, isActive: true },
      data,
      { new: true },
    );
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.accountModel.deleteOne({ userId });
  }
}
