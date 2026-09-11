import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schemas/users';
import { securedEncrypt } from '@/lib/encrypter-server';
import { createHash } from 'node:crypto';

export interface RegisterInput {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  company_name?: string;
  agree: boolean;
}

export async function registerUser(input: RegisterInput) {
  const encryptedPassword = securedEncrypt({
    data: input.password,
    timestamp: Date.now(),
  });

  // SHA-256 hex for login verification (deterministic)
  const passwordHash = createHash('sha256').update(input.password).digest('hex');

  const [row] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      whatsapp: input.whatsapp,
      password: encryptedPassword,
      password_hash: passwordHash,
      company_name: input.company_name ?? null,
      agree: input.agree,
    })
    .returning({ id: users.id });

  return row;
}
