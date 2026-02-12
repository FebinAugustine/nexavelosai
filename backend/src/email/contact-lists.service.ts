import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactList, ContactListDocument } from './contact-lists.schema';
import { Contact, ContactDocument } from './contacts.schema';

@Injectable()
export class ContactListsService {
  constructor(
    @InjectModel(ContactList.name)
    private contactListModel: Model<ContactListDocument>,
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
  ) {}

  async createContactList(
    userId: string,
    fileName: string,
    contacts: any[],
  ): Promise<ContactList> {
    const columns = contacts.length > 0 ? Object.keys(contacts[0]) : [];

    const contactList = new this.contactListModel({
      userId,
      fileName,
      contactCount: contacts.length,
      columns,
    });

    return contactList.save();
  }

  async getContactLists(userId: string): Promise<any> {
    const contactLists = await this.contactListModel.find({
      userId,
      isActive: true,
    });
    return { data: contactLists };
  }

  async getContactList(
    userId: string,
    listId: string,
  ): Promise<ContactList | null> {
    return this.contactListModel.findOne({
      _id: listId,
      userId,
      isActive: true,
    });
  }

  async getContactListPreview(userId: string, listId: string): Promise<any> {
    const contactList = await this.getContactList(userId, listId);
    if (!contactList) {
      throw new Error('Contact list not found');
    }

    const contacts = await this.contactModel.find({ userId }).limit(100);
    return { data: contacts };
  }

  async deleteContactList(userId: string, listId: string): Promise<void> {
    await this.contactListModel.deleteOne({ _id: listId, userId });
  }
}
