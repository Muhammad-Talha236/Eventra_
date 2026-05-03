import { Crown, MapPin, Users } from "lucide-react";

export default function Venue() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Venue Assignment</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Your assigned venues and team.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ev-accent)]">
              <MapPin className="h-6 w-6 text-[var(--ev-text)]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[var(--ev-muted)]">Primary venue</p>
              <p className="text-[22px] font-bold text-[var(--ev-text)]">Tech Arena A</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-[var(--ev-muted)]">Capacity 500 · Hosting Valorant Championship Finals on Day 1.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <p className="text-[var(--ev-muted)]">Gate</p><p className="font-semibold text-[var(--ev-text)]">Gate B</p>
            <p className="text-[var(--ev-muted)]">Floor</p><p className="font-semibold text-[var(--ev-text)]">Ground</p>
          </div>
        </div>

        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">Your Team</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3">
              <Crown className="h-4 w-4 text-[var(--ev-warning)]" />
              <div><p className="text-[13px] font-semibold text-[var(--ev-text)]">Sara Tariq</p><p className="text-[11px] text-[var(--ev-muted)]">Main Head</p></div>
            </div>
            {["Maira Iqbal", "Hina Yousaf", "Ahmed Noor"].map((n) => (
              <div key={n} className="flex items-center gap-3 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3">
                <Users className="h-4 w-4 text-[var(--ev-muted)]" /><p className="text-[13px] font-semibold text-[var(--ev-text)]">{n}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
