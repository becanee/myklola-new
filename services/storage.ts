import { r2, type R2 } from '@computesdk/r2';

export interface AttachmentResult {
  url: string;
  key: string;
  name: string;
  size: number;
}

function getStorage(): R2 | null {
  const accountId = process.env.R2_ACCOUNT_ID ?? '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? '';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? '';

  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return r2({ accessKeyId, secretAccessKey, accountId });
}

export async function downloadAttachment(key: string) {
  const bucket = process.env.R2_BUCKET ?? '';
  const storage = getStorage();
  if (!bucket || !storage) {
    throw new Error('R2 storage is not configured');
  }

  return storage.download(bucket, key);
}

/**
 * Upload files to Cloudflare R2 and return their public URLs.
 * @param companyId - used as folder prefix
 * @param files - array of { name, buffer, mimeType }
 * @returns array of { url, key, name, size }
 */
export async function uploadAttachments(
  companyId: string,
  files: { name: string; buffer: Uint8Array; mimeType: string }[],
): Promise<AttachmentResult[]> {
  const bucket = process.env.R2_BUCKET ?? '';
  if (!bucket) {
    console.warn('[storage] R2_BUCKET not configured — skipping upload');
    return [];
  }

  const storage = getStorage();
  if (!storage) {
    console.warn('[storage] R2 credentials not configured — skipping upload');
    return [];
  }

  const results: AttachmentResult[] = [];

  for (const file of files) {
    const timestamp = Date.now();
    const key = `${companyId}/tickets/${timestamp}-${file.name}`;

    await storage.upload(bucket, key, file.buffer, {
      contentType: file.mimeType,
    });

    results.push({
      key,
      name: file.name,
      size: file.buffer.length,
      url: `/api/v1/attachments?key=${encodeURIComponent(key)}`,
    });
  }

  return results;
}
