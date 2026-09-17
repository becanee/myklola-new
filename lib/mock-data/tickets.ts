import type { Ticket } from "@/lib/types/ticket";

export const mockTickets: Ticket[] = [
  {
    id: "TKT-1024",
    title: "Login user gagal setelah refresh halaman",
    description:
      "Setelah login, user gagal menavigasi ke dashboard saat halaman di-refresh. Error muncul di sisi client dan perlu investigasi ulang.",
    status: "In Progress",
    priority: "High",
    type: "Bug",
    assignee: "Adit",
    reporter: "Rina",
    labels: ["Frontend", "Security"],
    createdAt: "2026-09-10T09:15:00.000Z",
    dueDate: "2026-09-18T00:00:00.000Z",
    comments: [
      {
        id: "c1",
        author: "Rina",
        role: "Customer",
        message: "Saya sudah mencoba beberapa kali, tetap gagal.",
        createdAt: "2026-09-10T10:00:00.000Z",
      },
      {
        id: "c2",
        author: "Adit",
        role: "Agent",
        message: "Saya sedang cek token refresh flow dan sesi user.",
        createdAt: "2026-09-10T10:18:00.000Z",
      },
    ],
    attachments: [
      { id: "a1", name: "error-ss.png", type: "image/png", size: "1.2 MB" },
    ],
    activity: [
      { id: "ac1", from: "To Do", to: "In Progress", by: "Adit", at: "2026-09-10T10:20:00.000Z" },
    ],
  },
  {
    id: "TKT-1031",
    title: "Form pembayaran belum menampilkan error validasi",
    description:
      "User tidak menerima feedback saat jumlah nominal melebihi limit. UI tidak menampilkan pesan error yang jelas.",
    status: "To Do",
    priority: "Medium",
    type: "Task",
    assignee: "Nanda",
    reporter: "Budi",
    labels: ["Billing", "UI/UX"],
    createdAt: "2026-09-12T08:40:00.000Z",
    dueDate: "2026-09-21T00:00:00.000Z",
    comments: [
      { id: "c3", author: "Budi", role: "Customer", message: "Mohon tambahkan pesan jelas untuk input invalid.", createdAt: "2026-09-12T09:10:00.000Z" },
    ],
    attachments: [],
    activity: [
      { id: "ac2", from: "New", to: "To Do", by: "System", at: "2026-09-12T08:40:00.000Z" },
    ],
  },
  {
    id: "TKT-1042",
    title: "Minta update desain dashboard admin",
    description:
      "Dashboard admin perlu ada ringkasan status dan widget progress agar tim operasional lebih cepat memantau backlog.",
    status: "In Review",
    priority: "Low",
    type: "Story",
    assignee: "Lia",
    reporter: "Bagas",
    labels: ["Frontend", "UI/UX"],
    createdAt: "2026-09-08T12:05:00.000Z",
    dueDate: "2026-09-20T00:00:00.000Z",
    comments: [
      { id: "c4", author: "Lia", role: "Admin", message: "Sudah saya siapkan mockup quick overview.", createdAt: "2026-09-09T08:30:00.000Z" },
    ],
    attachments: [{ id: "a2", name: "dashboard-wireframe.pdf", type: "application/pdf", size: "2.8 MB" }],
    activity: [
      { id: "ac3", from: "In Progress", to: "In Review", by: "Lia", at: "2026-09-09T09:00:00.000Z" },
    ],
  },
  {
    id: "TKT-1058",
    title: "Integrasi chat widget belum responsive di mobile",
    description:
      "Widget live chat tidak sesuai ukuran ketika dibuka dari layar kecil. Diperlukan perbaikan layout mobile.",
    status: "Done",
    priority: "Medium",
    type: "Bug",
    assignee: "Rizki",
    reporter: "Dewi",
    labels: ["Frontend", "Mobile"],
    createdAt: "2026-09-03T11:00:00.000Z",
    dueDate: "2026-09-11T00:00:00.000Z",
    comments: [
      { id: "c5", author: "Rizki", role: "Agent", message: "Sudah diperbaiki untuk mode mobile.", createdAt: "2026-09-04T14:30:00.000Z" },
    ],
    attachments: [],
    activity: [
      { id: "ac4", from: "In Review", to: "Done", by: "Rizki", at: "2026-09-04T14:40:00.000Z" },
    ],
  },
  {
    id: "TKT-1061",
    title: "Reset password belum ada feedback sukses",
    description:
      "Setelah password berhasil direset, user tidak mendapat konfirmasi yang jelas. Perlu ada pesan sukses yang lebih jelas.",
    status: "Closed",
    priority: "Urgent",
    type: "Incident",
    assignee: "Sari",
    reporter: "Fajar",
    labels: ["Security"],
    createdAt: "2026-08-28T07:00:00.000Z",
    dueDate: "2026-09-05T00:00:00.000Z",
    comments: [
      { id: "c6", author: "Sari", role: "Admin", message: "Kasus sudah ditutup dan sesuai dengan SOP.", createdAt: "2026-08-29T09:00:00.000Z" },
    ],
    attachments: [],
    activity: [
      { id: "ac5", from: "Done", to: "Closed", by: "Sari", at: "2026-08-29T09:15:00.000Z" },
    ],
  },
];
