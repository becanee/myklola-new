import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { successResponse, failedResponse } from '@/lib/response';
import { securedDecrypt, securedEncrypt } from '@/lib/encrypter-server';
import { signJwt } from '@/lib/jwt';
import { loginUser } from '@/services/auth/login';
import { verifyTurnstileToken } from '@/services/cloudflareVerify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credentials, turnstile } = body as { credentials?: string; turnstile?: string };

    if (!credentials) {
      return failedResponse({ code: 400, message: 'Missing credentials' });
    }

    // Verify Turnstile token
    const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for') ?? '';
    const turnstileResult = await verifyTurnstileToken(turnstile, ip);
    if (!turnstileResult.success) {
      return failedResponse({ code: 400, message: 'Captcha verification failed. Please try again.' });
    }

    // Decrypt incoming credentials
    const decrypted = securedDecrypt<{ username?: string; password?: string }>(credentials);
    if (!decrypted?.username || !decrypted?.password) {
      return failedResponse({ code: 400, message: 'Invalid credential payload' });
    }

    // Verify against database
    const user = await loginUser(decrypted.username, decrypted.password);
    if (!user) {
      return failedResponse({ code: 401, message: 'Invalid username or password' });
    }

    // Sign JWT
    const token = await signJwt({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    });

    // Encrypt user payload for _U cookie
    const encryptedUser = securedEncrypt({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const maxAge = 86400; // 24h
    const response = NextResponse.json(
      successResponse({
        code: 200,
        message: 'Login successful',
        data: { redirect: '/admin' },
      }),
    );

    response.headers.append(
      'Set-Cookie',
      `_T=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    );
    response.headers.append(
      'Set-Cookie',
      `_C=KLOLA; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    );
    response.headers.append(
      'Set-Cookie',
      `_U=${encodeURIComponent(encryptedUser)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
    );

    return response;
  } catch (err) {
    console.error('[login] Error:', err);
    const message = err instanceof Error ? err.message : 'Login failed';
    return failedResponse({ code: 500, message });
  }
}
