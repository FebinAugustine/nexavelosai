import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleAccount, GoogleAccountDocument } from './google-account.schema';

@Injectable()
export class GoogleAccountService {
  constructor(
    @InjectModel(GoogleAccount.name)
    private googleAccountModel: Model<GoogleAccountDocument>,
  ) {}

  async connect(userId: string, googleData: any): Promise<GoogleAccount> {
    const existing = await this.googleAccountModel.findOne({ userId });
    if (existing) {
      const updated = await this.googleAccountModel.findByIdAndUpdate(
        existing._id,
        {
          accessToken: googleData.accessToken,
          refreshToken: googleData.refreshToken,
          email: googleData.email,
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

  async disconnect(userId: string): Promise<void> {
    await this.googleAccountModel.deleteOne({ userId });
  }

  async getByUserId(userId: string): Promise<GoogleAccount | null> {
    return this.googleAccountModel.findOne({ userId });
  }
}
