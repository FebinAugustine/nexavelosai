import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ContactList {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  contactCount: number;

  @Prop({ type: [String], required: true })
  columns: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export type ContactListDocument = ContactList & Document;
export const ContactListSchema = SchemaFactory.createForClass(ContactList);
