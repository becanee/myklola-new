import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { failedResponse } from '@/lib/response';
import { verifyJwtDetailed } from '@/lib/jwt';
import { r2 } from '@computesdk/r2';

const BUCKET = process.env.R2_BUCKET ?? '';

function getStorage() {
  const accountId = process.env.R2_ACCOUNT_ID ?? '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? '';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? '';
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return r2({ accessKeyId, secretAccessKey, accountId });
}

const MIME_MAP: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  csv: 'text/csv',
  zip: 'application/zip',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  try {
    // Verify JWT
    const tokenCookie = _request.cookies.get('_T')?.value;
    if (!tokenCookie) {
      return failedResponse({ code: 401, message: 'Unauthorized' });
    }
    const jwtResult = await verifyJwtDetailed(tokenCookie);
    if (!jwtResult.ok) {
      return failedResponse({ code: 401, message: 'Unauthorized' });
    }

    const { key } = await params;
    const fileKey = key.join('/');

    if (!BUCKET || !fileKey) {
      return failedResponse({ code: 400, message: 'Invalid request' });
    }

    const storage = getStorage();
    if (!storage) {
      return failedResponse({ code: 500, message: 'Storage not configured' });
    }

    const result = await storage.download(BUCKET, fileKey);
    const data = Buffer.from(result.data);

    const ext = fileKey.split('.').pop()?.toLowerCase() ?? '';
    const contentType = MIME_MAP[ext] ?? 'application/octet-stream';
    const fileName = fileKey.split('/').pop() ?? 'file';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return failedResponse({ code: 404, message: 'File not found' });
  }
}
