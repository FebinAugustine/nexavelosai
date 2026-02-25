import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ContactListsService } from './contact-lists.service';
import { Contact, ContactSchema } from './contacts.schema';
import { ContactList, ContactListSchema } from './contact-lists.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
      { name: ContactList.name, schema: ContactListSchema },
    ]),
  ],
  controllers: [ContactsController],
  providers: [ContactsService, ContactListsService],
  exports: [ContactsService, ContactListsService],
})
export class ContactsModule {}
