export function StatCard({ label, value, delta, icon: Icon, trend = "up" }) {
  return (
    <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5 transition-all duration-200 hover:border-[var(--ev-accent-border)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[var(--ev-muted)]">{label}</p>
          <p className="mt-2 text-[28px] font-bold leading-tight text-[var(--ev-text)]">{value}</p>
          {delta && (
            <p className={`mt-2 text-[12px] font-semibold ${trend === "up" ? "text-[var(--ev-success)]" : "text-[var(--ev-danger)]"}`}>
              {trend === "up" ? "↑" : "↓"} {delta}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ev-accent)]">
          <Icon className="h-5 w-5 text-[var(--ev-text)]" />
        </div>
      </div>
    </div>
  );
}
