import type { NextRequest } from 'next/server'
import { successResponse, failedResponse } from '@/lib/response'
import { verifyTurnstileToken } from '@/services/cloudflareVerify'
import { loginUser } from '@/services/auth/login'

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

    // Set two separate cookies (was previously one string with stray quote)
    response.headers.append(
      'Set-Cookie',
      `_T=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    )
    response.headers.append(
      'Set-Cookie',
      `_COMPANY=${encodeURIComponent(user?.company_id ?? '')}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    )

    return response
  } catch (err) {
    console.error('Login error:', err)
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat login'
    return failedResponse({ code: 500, message })
  }
}
