import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? '')

export type JwtResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; reason: 'expired' | 'malformed' | 'secret_mismatch' | 'other' }

export async function signJwt(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyJwtDetailed(token: string): Promise<JwtResult> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { ok: true, payload }
  } catch (err) {
    const code = err instanceof Error && 'code' in err
      ? String((err as Error & { code?: string }).code)
      : ''
    let reason: 'expired' | 'malformed' | 'secret_mismatch' | 'other'
    if (code === 'ERR_JWT_EXPIRED') {
      reason = 'expired'
    } else if (code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' || code === 'ERR_JWK_INVALID') {
      reason = 'secret_mismatch'
    } else if (code === 'ERR_JWT_INVALID') {
      reason = 'malformed'
    } else {
      reason = 'other'
    }
    return { ok: false, reason }
  }
}

export async function verifyJwt(token: string): Promise<Record<string, unknown> | null> {
  const result = await verifyJwtDetailed(token)
  return result.ok ? result.payload : null
}
