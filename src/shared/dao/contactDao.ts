import { Contact, LinkPrecedence } from '@prisma/client';
import prisma from '../clients/prisma';

export class ContactDao {
  /**
   * Creates a new contact
   */
  async create(data: {
    phoneNumber?: string | null;
    email?: string | null;
    linkedId?: number | null;
    linkPrecedence: LinkPrecedence;
  }): Promise<Contact> {
    return await prisma.contact.create({
      data: {
        ...data,
      },
    });
  }

  /**
   * Finds contacts with based on a given query
   */
  async findAll(query: object): Promise<Contact[]> {
    return await prisma.contact.findMany({
      where: query,
    });
  }

  /**
   * Updates a contact
   */
  async update(query: any, updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>) {
    return await prisma.contact.updateMany({
      where: query,
      data: {
        ...updates
      },
    });
  }

}
