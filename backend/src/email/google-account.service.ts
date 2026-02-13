import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleAccount, GoogleAccountDocument } from './google-account.schema';

@Injectable()
export class GoogleAccountService {
  private readonly MAX_ACCOUNTS = 10;

  constructor(
    @InjectModel(GoogleAccount.name)
    private googleAccountModel: Model<GoogleAccountDocument>,
  ) {}

  async connect(userId: string, googleData: any): Promise<GoogleAccount> {
    // Check if user has already connected this email
    const existingEmail = await this.googleAccountModel.findOne({
      userId,
      email: googleData.email,
    });
    if (existingEmail) {
      const updated = await this.googleAccountModel.findByIdAndUpdate(
        existingEmail._id,
        {
          accessToken: googleData.accessToken,
          refreshToken: googleData.refreshToken,
          name: googleData.name,
          picture: googleData.picture,
        },
        { new: true },
      );
      if (!updated) {
        throw new Error('Failed to update Google account');
      }
      return updated;
    }

    // Check if user has reached maximum number of accounts
    const userAccounts = await this.googleAccountModel.find({ userId });
    if (userAccounts.length >= this.MAX_ACCOUNTS) {
      throw new BadRequestException(
        `Maximum ${this.MAX_ACCOUNTS} accounts allowed`,
      );
    }

    const newAccount = new this.googleAccountModel({
      userId,
      email: googleData.email,
      name: googleData.name,
      picture: googleData.picture,
      accessToken: googleData.accessToken,
      refreshToken: googleData.refreshToken,
    });
    return newAccount.save();
  }

  async disconnect(userId: string, accountId: string): Promise<void> {
    await this.googleAccountModel.deleteOne({ _id: accountId, userId });
  }

  async getByUserId(userId: string): Promise<GoogleAccount[]> {
    return this.googleAccountModel.find({ userId });
  }

  async getById(
    userId: string,
    accountId: string,
  ): Promise<GoogleAccount | null> {
    return this.googleAccountModel.findOne({ _id: accountId, userId });
  }

  async setDefault(userId: string, accountId: string): Promise<void> {
    // Remove default from all accounts
    await this.googleAccountModel.updateMany(
      { userId },
      { $set: { isDefault: false } },
    );
    // Set new default
    await this.googleAccountModel.updateOne(
      { _id: accountId, userId },
      { $set: { isDefault: true } },
    );
  }
}
