import { db } from '@/drizzle/db';
import { contacts, contactStatusEnum } from '@/drizzle/schemas/contacts';

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  agree: boolean;
}

export async function createContact(input: CreateContactInput) {
  const [row] = await db
    .insert(contacts)
    .values(input)
    .returning({ id: contacts.id });

  return row;
}
