import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })

  // Clear all auth cookies
  response.headers.append('Set-Cookie', '_T=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
  response.headers.append('Set-Cookie', '_C=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
  response.headers.append('Set-Cookie', '_U=; Path=/; SameSite=Lax; Max-Age=0')

  return response
}
