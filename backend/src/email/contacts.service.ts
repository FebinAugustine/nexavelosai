import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './contacts.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
  ) {}

  async createContact(userId: string, data: any): Promise<Contact> {
    const contact = new this.contactModel({
      userId,
      ...data,
    });
    return contact.save();
  }

  async uploadContacts(userId: string, contacts: any[]): Promise<any> {
    const validContacts = contacts.filter(
      (contact) => contact.email && contact.email.includes('@'),
    );

    const contactsToCreate = validContacts.map((contact) => ({
      userId,
      ...contact,
    }));

    const result = await this.contactModel.insertMany(contactsToCreate);
    return {
      total: contacts.length,
      valid: validContacts.length,
      saved: result.length,
      errors: contacts.length - validContacts.length,
    };
  }

  async getContacts(userId: string, filters: any): Promise<any[]> {
    return this.contactModel.find({ userId, ...filters });
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    await this.contactModel.deleteOne({ _id: contactId, userId });
  }
}
