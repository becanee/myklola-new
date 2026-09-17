import type { TicketAttachment, TicketComment } from "@/lib/types/ticket";

export type TicketApiRecord = {
  id: string;
  company_id: string | null;
  subject: string | null;
  category: string;
  priority: string;
  status: string;
  description: string | null;
  attachments: Array<{ url?: string; name?: string; key?: string; size?: number; type?: string }> | null;
  closed_avg: number;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  assign_to: string | null;
  comments?: TicketComment[] | null;
  activity?: Array<{ id: string; from: string; to: string; by: string; at: string }> | null;
};

export async function fetchTickets(signal?: AbortSignal): Promise<TicketApiRecord[]> {
  const response = await fetch("/api/v1/tickets", { signal });
  const json = await response.json();
  if (!response.ok || !json.success || !Array.isArray(json.data)) {
    throw new Error(json.message || "Failed to load tickets");
  }
  return json.data as TicketApiRecord[];
}

export async function fetchTicket(ticketId: string, signal?: AbortSignal) {
  const response = await fetch(`/api/v1/tickets/${encodeURIComponent(ticketId)}`, { signal });
  const json = await response.json();
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.message || "Failed to load ticket");
  }
  return json.data as TicketApiRecord;
}

export async function createTicket(payload: {
  subject: string;
  category: string;
  priority: string;
  description: string;
  attachments?: File[];
}) {
  const formData = new FormData();
  formData.append("subject", payload.subject);
  formData.append("category", payload.category);
  formData.append("priority", payload.priority);
  formData.append("description", payload.description);
  payload.attachments?.forEach((file) => formData.append("attachments", file));

  return requestFormData<{ id: string }>("/api/v1/tickets", "POST", formData);
}

export async function updateTicket(ticketId: string, payload: {
  subject?: string;
  category?: string;
  priority?: string;
  description?: string;
}) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, value);
  });
  return requestFormData<TicketApiRecord>(`/api/v1/tickets/${encodeURIComponent(ticketId)}`, "PATCH", formData);
}

export async function postTicketComment(ticketId: string, message: string) {
  return requestJson<TicketComment>(`/api/v1/tickets/${encodeURIComponent(ticketId)}/comments`, "POST", { message });
}

export async function postTicketAttachments(ticketId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("attachments", file));
  return requestFormData<TicketAttachment[]>(`/api/v1/tickets/${encodeURIComponent(ticketId)}/attachments`, "POST", formData);
}

export function getTicketAttachmentUrl(url?: string, key?: string) {
  if (!url && !key) return "";
  if (url?.startsWith("http://") || url?.startsWith("https://") || url?.startsWith("/api/")) return url;
  return `/api/v1/attachments?key=${encodeURIComponent(key || url || "")}`;
}

async function requestJson<T>(url: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readResponse<T>(response);
}

async function requestFormData<T>(url: string, method: string, body: FormData): Promise<T> {
  const response = await fetch(url, { method, body });
  return readResponse<T>(response);
}

async function readResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok || !json.success) throw new Error(json.message || "Request failed");
  return json.data as T;
}
