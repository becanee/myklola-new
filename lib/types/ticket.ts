export type TicketStatus =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Done"
  | "Closed";

export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type TicketType = "Bug" | "Task" | "Story" | "Incident";

export type TicketLabel =
  | "Frontend"
  | "Backend"
  | "UI/UX"
  | "Billing"
  | "Security"
  | "Mobile";

export type TicketComment = {
  id: string;
  author: string;
  role: "Admin" | "Agent" | "Customer";
  message: string;
  createdAt: string;
};

export type TicketAttachment = {
  id: string;
  name: string;
  type: string;
  size: string;
  url?: string;
};

export type TicketActivity = {
  id: string;
  from: string;
  to: string;
  by: string;
  at: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assignee: string;
  reporter: string;
  labels: TicketLabel[];
  createdAt: string;
  dueDate: string;
  comments: TicketComment[];
  attachments: TicketAttachment[];
  activity: TicketActivity[];
};

export type TicketFilter = {
  status: "all" | TicketStatus;
  priority: "all" | TicketPriority;
  assignee: "all" | string;
  label: "all" | TicketLabel;
  search: string;
};
