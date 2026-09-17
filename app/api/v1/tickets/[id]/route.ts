import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { successResponse, failedResponse } from '@/lib/response';
import { db } from '@/drizzle/db';
import { tickets } from '@/drizzle/schemas/tickets';
import { verifyJwtDetailed } from '@/lib/jwt';
import { validatePayload } from '@/services/tickets/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tokenCookie = request.cookies.get('_T')?.value;
    if (!tokenCookie) {
      return failedResponse({ code: 401, message: 'Unauthorized — not logged in' });
    }

    const jwtResult = await verifyJwtDetailed(tokenCookie);
    if (!jwtResult.ok) {
      return failedResponse({ code: 401, message: 'Unauthorized — invalid session' });
    }

    const { id } = await params;
    const [row] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!row) {
      return failedResponse({ code: 404, message: 'Ticket not found' });
    }

    return successResponse({
      code: 200,
      message: 'Ticket retrieved successfully',
      data: row,
    });
  } catch (err) {
    console.error('[ticket-detail] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to retrieve ticket';
    return failedResponse({ code: 500, message });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tokenCookie = request.cookies.get('_T')?.value;
    if (!tokenCookie) {
      return failedResponse({ code: 401, message: 'Unauthorized — not logged in' });
    }

    const jwtResult = await verifyJwtDetailed(tokenCookie);
    if (!jwtResult.ok) {
      return failedResponse({ code: 401, message: 'Unauthorized — invalid session' });
    }

    const { id } = await params;
    const existing = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!existing[0]) {
      return failedResponse({ code: 404, message: 'Ticket not found' });
    }

    const formData = await request.formData();
    const subject = (formData.get('subject') as string | null)?.trim() ?? '';
    const category = (formData.get('category') as string | null) ?? existing[0].category ?? 'General';
    const priority = (formData.get('priority') as string | null) ?? existing[0].priority ?? 'Medium';
    const description = (formData.get('description') as string | null) ?? existing[0].description ?? '';

    const validation = validatePayload({ subject, category, priority });
    if (!validation.valid) {
      return failedResponse({ code: 400, message: validation.errors.join(', ') });
    }

    const [updated] = await db
      .update(tickets)
      .set({
        subject: subject || null,
        category: category as any,
        priority: priority as any,
        description: description || null,
        updated_at: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();

    return successResponse({
      code: 200,
      message: 'Ticket updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error('[ticket-edit] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to update ticket';
    return failedResponse({ code: 500, message });
  }
}
