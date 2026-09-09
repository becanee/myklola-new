import { z } from 'zod';
import { NextResponse } from 'next/server';

const schema = z.object({
  // Identity
  fullName: z.string().min(2),
  companyName: z.string().optional().default(''),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  // Request
  purpose: z.string().min(5),
  questions: z.string().optional().default(''),
  // Scheduling
  date: z.coerce.date(),
  duration: z.string().min(1),
  startTime: z.string().min(1),
  // Turnstile
  token: z.string().min(1),
});

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY ?? '',
        response: token,
      }),
    }
  );
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const valid = await verifyTurnstile(data.token);
    if (!valid) {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 403 }
      );
    }

    // TODO: integrate with your actual delivery channel
    // Examples: Resend / SendGrid email, Discord webhook, Supabase insert, etc.
    console.log('[Request Demo]', {
      fullName: data.fullName,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      purpose: data.purpose,
      questions: data.questions,
      date: data.date.toISOString(),
      duration: data.duration,
      startTime: data.startTime,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
