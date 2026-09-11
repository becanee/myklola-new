import type { NextRequest } from 'next/server';
import { successResponse, failedResponse } from '@/lib/response';
import { verifyTurnstileToken } from '@/services/cloudflareVerify';
import { registerUser } from '@/services/auth/register';

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
    await registerUser({
      name: body.name,
      email: body.email,
      whatsapp: body.whatsapp,
      password: body.password,
      company_name: body.company_name ?? undefined,
      agree: body.agree ?? false,
    });

    return successResponse({
      code: 201,
      message: 'Registration successful',
    });
  } catch (err) {
    console.error('DB insert error:', err);
    const message = err instanceof Error ? err.message : 'Failed to register user';
    return failedResponse({ code: 500, message });
  }
}
