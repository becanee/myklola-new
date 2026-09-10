import type { NextRequest } from 'next/server';
import { successResponse, failedResponse } from '@/lib/response';
import { verifyTurnstileToken } from '@/services/cloudflareVerify';
import { createDemoRequest } from '@/services/request-demo';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return failedResponse({ code: 400, message: 'Request body must be valid JSON' });
  }

  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '';

  const verification = await verifyTurnstileToken(body.token, ip);
  if (!verification.success) {
    return failedResponse({
      code: 400,
      message: `Turnstile verification failed: ${JSON.stringify(verification['error-codes'])}`,
    });
  }

  try {
    await createDemoRequest({
      fullName: body.fullName,
      companyName: body.companyName,
      email: body.email,
      phone: body.phone,
      purpose: body.purpose,
      questions: body.questions,
      date: body.date,
      duration: body.duration,
      startTime: body.startTime,
    });

    return successResponse({
      code: 201,
      message: 'Demo request submitted successfully',
    });
  } catch (err) {
    console.error('DB insert error:', err);
    const message = err instanceof Error ? err.message : 'Failed to save demo request';
    return failedResponse({ code: 500, message });
  }
}
