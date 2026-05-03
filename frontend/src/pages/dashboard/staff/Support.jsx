import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const tickets = [
  { id: "s1", user: "Ali Hassan", subject: "Cannot find my QR ticket", priority: "high", time: "12 min ago" },
  { id: "s2", user: "Sana Khan", subject: "Refund for cancelled match", priority: "medium", time: "1h ago" },
  { id: "s3", user: "Hamza Iqbal", subject: "Wrong seat allocation", priority: "low", time: "3h ago" },
];

export default function Support() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">User Support</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Open support tickets needing attention.</p>
      </div>

      <div className="space-y-3">
        {tickets.map((t) => (
          <div key={t.id} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5 flex items-center gap-4 hover:border-[var(--ev-accent-border)] transition-all">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[var(--ev-accent)] text-[11px] font-semibold text-white">
                {t.user.split(" ").map((s) => s[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[var(--ev-text)]">{t.subject}</p>
              <p className="text-[12px] text-[var(--ev-muted)]">{t.user} · {t.time}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${
              t.priority === "high" ? "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)]" :
              t.priority === "medium" ? "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]" :
              "bg-[var(--ev-border)] text-[var(--ev-muted)]"
            }`}>{t.priority}</span>
            <Button size="sm" className="border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-lg text-[13px]">Reply</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
