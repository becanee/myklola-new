import type { NextRequest } from 'next/server';
import { successResponse, failedResponse } from '@/lib/response';
import { db } from '@/drizzle/db';
import { demoRequests } from '@/drizzle/schemas/demo_requests';

const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

async function validateTurnstile(token: string | undefined, remoteIp: string) {
  if (!token) return { success: false, 'error-codes': ['missing-token'] };

  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: SECRET_KEY, response: token, remoteip: remoteIp }),
      },
    );
    return await res.json();
  } catch {
    return { success: false, 'error-codes': ['internal-error'] };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return failedResponse({ code: 400, message: 'Request body must be valid JSON' });
  }

  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '';

  // Validate Turnstile first
  const verification = await validateTurnstile(body.token, ip);
  if (!verification.success) {
    return failedResponse({
      code: 400,
      message: `Turnstile verification failed: ${JSON.stringify(verification['error-codes'])}`,
    });
  }

  try {
    const preferredDate = body.date instanceof Date ? body.date : new Date(body.date);

    const inserted = await db
      .insert(demoRequests)
      .values({
        full_name: body.fullName,
        company_name: body.companyName || null,
        email: body.email,
        phone: body.phone || null,
        purpose: body.purpose,
        questions: body.questions || null,
        preferred_date: preferredDate,
        duration: body.duration,
        start_time: body.startTime,
      })
      .returning({ id: demoRequests.id });

    return successResponse({
      code: 201,
      message: 'Demo request submitted successfully',
      // data: inserted[0],
    });
  } catch (err) {
    console.error('DB insert error:', err);
    const message = err instanceof Error ? err.message : 'Failed to save demo request';
    return failedResponse({ code: 500, message });
  }
}
