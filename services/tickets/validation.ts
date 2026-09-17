export type ValidationResult = { valid: true } | { valid: false; errors: string[] };

const CATEGORIES = ['General', 'Account', 'Incident', 'Bussiness', 'Payroll', 'Helpdesk'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export function validatePayload(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!body.subject || typeof body.subject !== 'string' || !body.subject.trim()) {
    errors.push('Subject is required');
  }

  if (body.category && !CATEGORIES.includes(body.category as string)) {
    errors.push('Invalid category');
  }

  if (body.priority && !PRIORITIES.includes(body.priority as string)) {
    errors.push('Invalid priority');
  }

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true };
}
