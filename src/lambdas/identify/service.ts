import { ContactDao } from "../../shared/dao/contactDao";
import { Contact, LinkPrecedence } from '@prisma/client';
import { IdentifyRequest, IdentifyResponse } from "./interface";
import logger from "../../shared/logger/logger";


export class IdentifyContact {
    private contactDao: ContactDao = new ContactDao();

    private formatResponse(contacts: Contact[]): IdentifyResponse {
        // Find the primary contact
        const primary: Contact = contacts.find(c => c.linkPrecedence === LinkPrecedence.primary)!;
        logger.info("IdentifyContact: formatResponse: primary: ", primary);

        const emailsSet = new Set<string>();
        const phoneSet = new Set<string>();
        if (primary.email) emailsSet.add(primary.email);
        if (primary.phoneNumber) phoneSet.add(primary.phoneNumber);  

        const secondaryIds: number[] = [];

        for (const c of contacts){
            if (c.id === primary.id) continue;
            if (c.email && !emailsSet.has(c.email)) emailsSet.add(c.email);
            if (c.phoneNumber && !phoneSet.has(c.phoneNumber)) phoneSet.add(c.phoneNumber);
            if (c.linkPrecedence === LinkPrecedence.secondary) secondaryIds.push(c.id);
        }
        
        return {
            contact: {
                primaryContatctId: primary.id,
                emails: Array.from(emailsSet),
                phoneNumbers: Array.from(phoneSet),
                secondaryContactIds: secondaryIds
            }
        }

    }

    async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
        try {
            const { email, phoneNumber } = request;
            
            if (!email && !phoneNumber) {
                throw new Error("At least one of email or phoneNumber must be provided");
            }

            // Find all contacts matching email or phone number which are not deleted
            const matchedContacts = await this.contactDao.findAll({
                deletedAt: null,
                OR: [
                    { email: email ?? undefined },
                    { phoneNumber: phoneNumber ?? undefined },
                ],
            });
            logger.info("IdentifyContact: identify: matchedContacts: ", matchedContacts);

            if(matchedContacts.length === 0) {
                const newContact = await this.contactDao.create({
                    email: email || null,
                    phoneNumber: phoneNumber || null,
                    linkPrecedence: LinkPrecedence.primary,
                    linkedId: null,
                });

                return this.formatResponse([newContact]);
            }

            // Find unique primary contacts among the matched contacts
            const primaryIds = new Set<number>();
            for (const c of matchedContacts) {
                if (c.linkPrecedence === LinkPrecedence.primary) {
                    primaryIds.add(c.id);
                } else if (c.linkedId !== null) {
                    primaryIds.add(c.linkedId)
                }
            }

            // All matched contacts belong to same identity group
            if (primaryIds.size === 1) {
                const primaryId = Array.from(primaryIds)[0];

                const linkedContacts = await this.contactDao.findAll({
                    deletedAt: null,
                    OR: [
                        { id: primaryId },
                        { linkedId: primaryId },
                    ],
                })

                // Check if the request contains some new information
                const hasEmail = linkedContacts.some(c => c.email === email);
                const hasPhone = linkedContacts.some(c => c.phoneNumber === phoneNumber);

                // If contains new information then create a secondary contact linked to the primary contact
                if(
                    (email && !hasEmail) ||
                    (phoneNumber && !hasPhone)
                ) {
                    const newSecondary = await this.contactDao.create({
                        email: email || null,
                        phoneNumber: phoneNumber || null,
                        linkPrecedence: LinkPrecedence.secondary,
                        linkedId: primaryId,
                    });

                    linkedContacts.push(newSecondary);
                }

                return this.formatResponse(linkedContacts);
            }

            // In case of multiple primary groups, need to merge contacts
            const primaryContacts = await this.contactDao.findAll({
                deletedAt: null,
                id: {
                    in: Array.from(primaryIds)
                }
            });

            // find the oldest record
            primaryContacts.sort((a: Contact, b: Contact) => a.createdAt.getTime() - b.createdAt.getTime());

            const newPrimaryContact = primaryContacts[0];
            const contactsToDemote = primaryContacts.slice(1);

            // Demote other primaries and their secondaries to secondary, linked to the new primary
            await Promise.all([
                ...contactsToDemote.map(contact => 
                    this.contactDao.update({id: contact.id}, {
                        linkPrecedence: LinkPrecedence.secondary,
                        linkedId: newPrimaryContact.id
                    })
                ),
                ...contactsToDemote.map(contact =>
                    this.contactDao.update({linkedId: contact.id}, {
                        linkedId: newPrimaryContact.id
                    })
                )
            ])

            // Fetch all the contacts linked to the new primary contact after update
            const allLinkedContacts = await this.contactDao.findAll({
                deletedAt: null,
                OR: [
                    { id: newPrimaryContact.id },
                    { linkedId: newPrimaryContact.id },
                ],
            })

            return this.formatResponse(allLinkedContacts);

        } catch (error) {
            console.log("IdentifyContact: Error: ", error);
            throw error;
        }
    }
}
