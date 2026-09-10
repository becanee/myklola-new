const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export interface TurnstileResult {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string,
): Promise<TurnstileResult> {
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
    return (await res.json()) as TurnstileResult;
  } catch {
    return { success: false, 'error-codes': ['internal-error'] };
  }
}
