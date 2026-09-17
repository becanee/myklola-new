import type { AdminUser } from "@/lib/types/admin-user";
import type { Ticket, TicketStatus } from "@/lib/types/ticket";

export type AdminDashboardResponse = {
  summary: Array<{ status: TicketStatus; count: number }>;
  recentTickets: Ticket[];
  charts: {
    byStatus: Array<{ status: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
    trend: Array<{ month: string; created: number; resolved: number }>;
  };
};

export type AdminUserPayload = Omit<AdminUser, "id" | "lastLogin" | "roles"> & {
  role: string;
};

export async function fetchAdminDashboard(signal?: AbortSignal) {
  return request<AdminDashboardResponse>("/api/v1/admin/dashboard", { signal });
}

export async function fetchAdminUsers(params?: {
  search?: string;
  status?: string;
  role?: string;
}, signal?: AbortSignal) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => value && value !== "all" && query.set(key, value));
  const suffix = query.toString() ? `?${query}` : "";
  return request<AdminUser[]>(`/api/v1/admin/users${suffix}`, { signal });
}

export async function createAdminUser(payload: AdminUserPayload) {
  return request<AdminUser>("/api/v1/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminTicketStatus(ticketId: string, status: TicketStatus) {
  return request<Ticket>(`/api/v1/admin/tickets/${encodeURIComponent(ticketId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const json = await response.json();
  if (!response.ok || !json.success) throw new Error(json.message || "Admin request failed");
  return json.data as T;
}
