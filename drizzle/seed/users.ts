import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schemas/users';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function seed() {
  const password = '@Kl0l4root4dm123Abc!';
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, 'superadmin'))
    .limit(1);

  if (existing) {
    console.log('[seed] superadmin user already exists — skipping insert.');
    process.exit(0);
  }

  await db.insert(users).values({
    name: 'Superadmin',
    username: 'superadmin',
    email: 'dev@klola.id',
    password: passwordHash,
    role: 'Superadmin',
  });

  console.log('[seed] superadmin user created successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
