export type AdminUserStatus = "Active" | "Inactive";

export type AdminUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  department: string;
  position: string;
  roles: string[];
  status: AdminUserStatus;
  lastLogin: string;
  avatarUrl?: string;
};
