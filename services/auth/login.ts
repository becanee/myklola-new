import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schemas/users';
import bcrypt from 'bcrypt';

export async function loginUser(username: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}
