"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, SendHorizonal, PhoneCall } from "lucide-react";

type ChatMessage = {
  id: string;
  sender: "me" | "agent";
  text: string;
  time: string;
};

type ChatThread = {
  id: string;
  customer: string;
  title: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
};

const initialThreads: ChatThread[] = [
  {
    id: "chat-1",
    customer: "Rina",
    title: "Login issue",
    unread: 2,
    online: true,
    messages: [
      { id: "m1", sender: "agent", text: "Halo Rina, ada yang bisa kami bantu?", time: "09:14" },
      { id: "m2", sender: "me", text: "Saya tidak bisa login setelah refresh.", time: "09:15" },
    ],
  },
  {
    id: "chat-2",
    customer: "Budi",
    title: "Payment form",
    unread: 0,
    online: false,
    messages: [{ id: "m3", sender: "agent", text: "Terima kasih, kami cek form pembayaran.", time: "08:30" }],
  },
];

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [activeId, setActiveId] = useState(initialThreads[0].id);
  const [draft, setDraft] = useState("");

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeId) ?? threads[0],
    [threads, activeId],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id !== activeId) return thread;
          if (Math.random() > 0.7) {
            const incoming: ChatMessage = {
              id: `m-${Date.now()}`,
              sender: "agent",
              text: "Kami sudah menerima laporan Anda dan sedang menindaklanjuti.",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            return {
              ...thread,
              messages: [...thread.messages, incoming],
            };
          }
          return thread;
        }),
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [activeId]);

  const sendMessage = () => {
    if (!draft.trim() || !activeThread) return;

    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "me",
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === activeThread.id
          ? { ...thread, messages: [...thread.messages, message] }
          : thread,
      ),
    );
    setDraft("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Customer Support</p>
          <h1 className="text-2xl font-semibold text-foreground">Live Chat</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
          <PhoneCall className="size-3.5" />
          Agent Online
        </div>
      </div>

      <div className="grid min-h-[600px] gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-border bg-background p-3">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveId(thread.id)}
              className={[
                "mb-2 flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors",
                activeId === thread.id ? "border-primary/40 bg-primary/10" : "border-border bg-card",
              ].join(" ")}
            >
              <div>
                <p className="font-medium text-foreground">{thread.customer}</p>
                <p className="mt-1 text-xs text-muted-foreground">{thread.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {thread.unread > 0 && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{thread.unread}</span>}
                <span className={thread.online ? "size-2.5 rounded-full bg-emerald-400" : "size-2.5 rounded-full bg-muted-foreground"} />
              </div>
            </button>
          ))}
        </aside>

        <div className="flex min-h-[560px] flex-col rounded-2xl border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-medium text-foreground">{activeThread.customer}</p>
              <p className="text-xs text-muted-foreground">{activeThread.title}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquareText className="size-4" />
              {activeThread.online ? "Online" : "Offline"}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {activeThread.messages.map((message) => (
              <div key={message.id} className={message.sender === "me" ? "flex justify-end" : "flex justify-start"}>
                <div className={[
                  "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                  message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                ].join(" ")}>
                  <p>{message.text}</p>
                  <p className={message.sender === "me" ? "mt-1 text-[10px] text-primary-foreground/80" : "mt-1 text-[10px] text-muted-foreground"}>{message.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
              <button onClick={sendMessage} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                <SendHorizonal className="size-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
