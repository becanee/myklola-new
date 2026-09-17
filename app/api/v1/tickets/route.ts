import type { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { successResponse, failedResponse } from '@/lib/response';
import { db } from '@/drizzle/db';
import { tickets } from '@/drizzle/schemas/tickets';
import { verifyJwtDetailed } from '@/lib/jwt';
import { securedDecrypt } from '@/lib/encrypter-server';
import { uploadAttachments } from '@/services/storage';
import { validatePayload } from '@/services/tickets/validation';

export async function GET(request: NextRequest) {
  try {
    // 1. Validate JWT from _T cookie
    const tokenCookie = request.cookies.get('_T')?.value;
    if (!tokenCookie) {
      return failedResponse({ code: 401, message: 'Unauthorized — not logged in' });
    }

    const jwtResult = await verifyJwtDetailed(tokenCookie);
    if (!jwtResult.ok) {
      return failedResponse({ code: 401, message: 'Unauthorized — invalid session' });
    }

    // 2. Get user id from _U cookie
    const encryptedUser = request.cookies.get('_U')?.value;
    let userId = '';
    if (encryptedUser) {
      try {
        const user = securedDecrypt<Record<string, unknown>>(decodeURIComponent(encryptedUser));
        if (user?.id) userId = String(user.id);
      } catch {
        // fallback
      }
    }

    // 3. Get company_id from _C cookie
    const companyId = request.cookies.get('_C')?.value ?? '';

    // 4. Query tickets filtered by company_id and created_by
    const rows = await db
      .select()
      .from(tickets)
      .where(
        companyId && userId
          ? eq(tickets.company_id, companyId) && eq(tickets.created_by, userId)
          : companyId
            ? eq(tickets.company_id, companyId)
            : userId
              ? eq(tickets.created_by, userId)
              : undefined,
      )
      .orderBy(desc(tickets.created_at));

    return successResponse({
      code: 200,
      message: 'Tickets retrieved successfully',
      data: rows,
    });
  } catch (err) {
    console.error('[tickets] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to retrieve tickets';
    return failedResponse({ code: 500, message });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate JWT from _T cookie (automatic with every request)
    const wsTokenCookie: any = request.cookies.get('_T')?.value;
    const userCookie: any = request.cookies.get('_U')?.value;

    if (!userCookie || !wsTokenCookie) {
      return failedResponse({ code: 401, message: 'Unauthorized — not logged in' });
    }

    const jwtResult: any = await verifyJwtDetailed(wsTokenCookie);
    const jwtResultUser: any = await securedDecrypt(userCookie);
    if (!jwtResult.ok) {
      return failedResponse({ code: 401, message: 'Unauthorized — invalid session' });
    }

    // 2. Read _C cookie for company_id
    const companyId = request.cookies.get('_C')?.value ?? '';

    // 3. Get created_by from JWT payload
    const createdBy = String(jwtResultUser?.id ?? '');

    // 4. Parse multipart form data
    const formData = await request.formData();
    const subject = (formData.get('subject') as string) ?? '';
    const category = (formData.get('category') as string) ?? 'General';
    const priority = (formData.get('priority') as string) ?? 'Medium';
    const description = (formData.get('description') as string) ?? '';

    // Validate payload
    const validation = validatePayload({ subject, category, priority });
    if (!validation.valid) {
      return failedResponse({ code: 400, message: validation.errors.join(', ') });
    }

    // 5. Process attachments (multipart files from FormData)
    const rawFiles = formData.getAll('attachments') as File[];
    const filesToUpload: { name: string; buffer: Uint8Array; mimeType: string }[] = [];
    for (const file of rawFiles) {
      if (file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        filesToUpload.push({
          name: file.name,
          buffer: new Uint8Array(arrayBuffer),
          mimeType: file.type,
        });
      }
    }

    let attachments: { url: string; key: string; name: string; size: number }[] = [];
    if (filesToUpload.length > 0) {
      attachments = await uploadAttachments(companyId, filesToUpload);
    }

    // 6. Insert into database
    const [row] = await db
      .insert(tickets)
      .values({
        company_id: companyId || null,
        subject: subject || null,
        category: category as any,
        priority: priority as any,
        description: description || null,
        attachments: attachments.length > 0 ? attachments : null,
        created_by: createdBy || null,
      })
      .returning({ id: tickets.id });

    return successResponse({
      code: 201,
      message: 'Ticket created successfully',
      data: { id: row.id },
    });
  } catch (err) {
    console.error('[ticket] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create ticket';
    return failedResponse({ code: 500, message });
  }
}
