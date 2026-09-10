import { db } from '@/drizzle/db';
import { demoRequests } from '@/drizzle/schemas/demo_requests';

export interface CreateDemoRequestInput {
  fullName: string;
  companyName?: string | null;
  email: string;
  phone?: string | null;
  purpose: string;
  questions?: string | null;
  date: string | Date;
  duration: string;
  startTime: string;
}

export async function createDemoRequest(input: CreateDemoRequestInput) {
  const preferredDate = input.date instanceof Date ? input.date : new Date(input.date);

  const [row] = await db
    .insert(demoRequests)
    .values({
      full_name: input.fullName,
      company_name: input.companyName ?? null,
      email: input.email,
      phone: input.phone ?? null,
      purpose: input.purpose,
      questions: input.questions ?? null,
      preferred_date: preferredDate,
      duration: input.duration,
      start_time: input.startTime,
    })
    .returning({ id: demoRequests.id });

  return row;
}
