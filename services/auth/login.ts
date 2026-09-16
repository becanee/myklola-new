import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schemas/users';
import { createHash } from 'node:crypto';
import { signJwt, verifyJwt } from '@/lib/jwt';

export interface LoginInput {
  email: string;
  password: string;
}

function hashPassword(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  company_id: string | null;
  company_name: string | null;
  role: 'ADMIN' | 'CLIENT' | 'ONBOARD';
  agree: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function loginUser(input: LoginInput): Promise<{
  token: string | null;
  user: Record<string, unknown> | null;
  requiresReset: boolean;
}> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (!result[0]) {
    // Security: don't reveal whether the email exists
    return { token: null, user: null, requiresReset: false };
  }

  const user = result[0] as UserRow & { password: string; password_hash?: string | null };

  // Check role !== "ONBOARD"
  // if (user.role === 'ONBOARD') {
  //   return { token: null, user: null, requiresReset: true };
  // }

  // Verify password via SHA-256 comparison against password_hash column
  const providedHash = hashPassword(input.password);
  if (!user.password_hash || providedHash !== user.password_hash) {
    // No password_hash means pre-migration user — needs admin reset
    if (!user.password_hash) {
      return { token: null, user: null, requiresReset: true };
    }
    return { token: null, user: null, requiresReset: false };
  }

  // Build safe user object (exclude password / password_hash)
  const safeUser: Record<string, unknown> = {
    id: user.id,
    name: user.name,
    email: user.email,
    whatsapp: user.whatsapp,
    company_id: user.company_id,
    company_name: user.company_name,
    role: user.role,
    agree: user.agree,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };

  // Sign JWT with all user fields
  const token = await signJwt(safeUser);

  return { token, user: safeUser, requiresReset: false };
}
