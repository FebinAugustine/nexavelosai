import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  contactListId?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  company?: string;

  @Prop()
  phone?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: Object })
  customFields?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export type ContactDocument = Contact & Document;
export const ContactSchema = SchemaFactory.createForClass(Contact);
