
/**
 * Generate ticket ID pattern: KLTKT-[0-9]{6}  e.g. KLTKT-123098
 */
export function generateTicketId(): string {
  const DIGITS = '0123456789';
  let id = 'KLTKT-';
  for (let i = 0; i < 6; i++) {
    id += DIGITS[Math.floor(Math.random() * DIGITS.length)];
  }
  return id;
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for') ??
    ''
  );
}
