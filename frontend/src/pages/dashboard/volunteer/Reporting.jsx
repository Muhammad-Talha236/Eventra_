import { Clock, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const shifts = [
  { day: "Day 1 — Mon May 12", time: "4:00 PM – 11:00 PM", venue: "Tech Arena A", status: "completed" },
  { day: "Day 2 — Tue May 13", time: "6:00 PM – 1:00 AM", venue: "Main Stage", status: "active" },
  { day: "Day 3 — Wed May 14", time: "12:00 PM – 8:00 PM", venue: "Cultural Lawn", status: "upcoming" },
];

export default function Reporting() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Reporting Time</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Clock in and out of your shifts.</p>
      </div>

      <div className="max-w-md rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <p className="text-[11px] uppercase tracking-widest text-[var(--ev-muted)]">Current shift</p>
        <p className="mt-1 text-[24px] font-bold text-[var(--ev-accent)]">Day 2 · Main Stage</p>
        <p className="mt-2 flex items-center gap-2 text-[13px] text-[var(--ev-muted)]">
          <Clock className="h-4 w-4" /> 6:00 PM – 1:00 AM
        </p>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => toast.success(`Clocked in at ${new Date().toLocaleTimeString()}`)} className="flex-1 bg-[var(--ev-success)] text-black hover:bg-[var(--ev-success)] rounded-[10px]">
            <Play className="mr-2 h-4 w-4" /> Clock in
          </Button>
          <Button onClick={() => toast("Clocked out")} className="flex-1 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">
            <Square className="mr-2 h-4 w-4" /> Clock out
          </Button>
        </div>
      </div>

      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">All Shifts</h3>
        <div className="space-y-2">
          {shifts.map((s) => (
            <div key={s.day} className="flex items-center justify-between rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3">
              <div>
                <p className="text-[13px] font-semibold text-[var(--ev-text)]">{s.day}</p>
                <p className="text-[12px] text-[var(--ev-muted)]">{s.time} · {s.venue}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                s.status === "completed" ? "bg-[var(--ev-border)] text-[var(--ev-muted)]" :
                s.status === "active" ? "bg-[var(--ev-success-bg)] text-[var(--ev-success)]" :
                "bg-[var(--ev-accent-bg)] text-[var(--ev-accent)]"
              }`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
