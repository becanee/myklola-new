import type { NextRequest } from 'next/server'
import { successResponse, failedResponse } from '@/lib/response'
import { verifyTurnstileToken } from '@/services/cloudflareVerify'
import { loginUser } from '@/services/auth/login'
import { securedEncrypt } from '@/lib/encrypter-server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return failedResponse({ code: 400, message: 'Request body must be valid JSON' })
  }

  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || ''

  const verification = await verifyTurnstileToken(body.token, ip)
  if (!verification.success) {
    return failedResponse({
      code: 400,
      message: `Turnstile verification failed: ${JSON.stringify(verification['error-codes'])}`,
    })
  }

  try {
    const { token, user, requiresReset } = await loginUser({
      email: body.email,
      password: body.password,
    })

    if (!token) {
      if (requiresReset) {
        return failedResponse({
          code: 403,
          message: 'Akun Anda perlu di-reset sebelum masuk. Hubungi admin.',
        })
      }
      return failedResponse({ code: 401, message: 'Email atau password salah' })
    }

    const response = successResponse({
      code: 200,
      message: 'Login berhasil',
      data: { redirect: '/client' },
    })

    const maxAge = 86400 // 24h

    // _T — httpOnly JWT (server-side validation only, XSS-proof)
    response.headers.append(
      'Set-Cookie',
      `_T=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    )
    // _COMPANY — httpOnly company id
    response.headers.append(
      'Set-Cookie',
      `_C=${encodeURIComponent(user?.company_id ?? '')}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    )
    // _USER — non-httpOnly, encrypted via securedEncrypt (AES-256-CBC + HMAC-SHA3-512)
    // Client decrypts via encrypter-client.ts's securedDecrypt for auth state + user info.
    const encryptedUser = securedEncrypt({
      id: user?.id,
      name: user?.name,
      email: user?.email,
      whatsapp: user?.whatsapp,
      role: user?.role,
      company_id: user?.company_id,
      company_name: user?.company_name,
      created_at: user?.created_at,
    })
    response.headers.append(
      'Set-Cookie',
      `_U=${encodeURIComponent(encryptedUser)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
    )

    return response
  } catch (err) {
    console.error('Login error:', err)
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat login'
    return failedResponse({ code: 500, message })
  }
}
