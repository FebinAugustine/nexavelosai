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

    const savedContactList = await contactList.save();

    // Set contactListId on all uploaded contacts
    const validContacts = contacts.filter(
      (contact) => contact.email && contact.email.includes('@'),
    );

    await Promise.all(
      validContacts.map(async (contact, index) => {
        // Find the contact by email and update
        const existingContact = await this.contactModel.findOne({
          userId,
          email: contact.email,
        });

        if (existingContact) {
          existingContact.contactListId = savedContactList._id.toString();
          await existingContact.save();
        } else {
          // Create new contact with contactListId
          await this.contactModel.create({
            userId,
            ...contact,
            contactListId: savedContactList._id.toString(),
          });
        }
      }),
    );

    return savedContactList;
  }

  async getContactLists(userId: string): Promise<any> {
    const contactLists = await this.contactListModel.find({
      userId,
      isActive: true,
    });
    return contactLists;
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

    const contacts = await this.contactModel
      .find({ userId, contactListId: listId })
      .limit(100);
    return { data: contacts };
  }

  async deleteContactList(userId: string, listId: string): Promise<void> {
    // Soft delete the contact list
    await this.contactListModel.updateOne(
      { _id: listId, userId },
      { isActive: false },
    );

    // Also remove the contactListId from all associated contacts
    await this.contactModel.updateMany(
      { userId, contactListId: listId },
      { $unset: { contactListId: 1 } },
    );
  }
}
