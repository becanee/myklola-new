import { z } from 'zod';
import { NextResponse } from 'next/server';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  category: z.string().min(1),
  message: z.string().min(10),
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
        secret: TURNSTILE_SECRET_KEY,
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

    // Verify Turnstile token server-side
    const valid = await verifyTurnstile(data.token);
    if (!valid) {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 403 }
      );
    }

    // TODO: integrate with your actual delivery channel
    // Examples: Resend / SendGrid email, Discord webhook, Supabase insert, etc.
    console.log('[Contact Form]', {
      name: data.name,
      email: data.email,
      subject: data.subject,
      category: data.category,
      message: data.message,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  }
}
