import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GoogleAccount {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  picture?: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop()
  refreshToken?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDefault: boolean;
}

export type GoogleAccountDocument = GoogleAccount & Document;
export const GoogleAccountSchema = SchemaFactory.createForClass(GoogleAccount);
