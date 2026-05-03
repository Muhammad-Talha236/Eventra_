import { cn } from "@/lib/utils";

export function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6 transition-all duration-200",
        hover && "hover:border-[var(--ev-accent-border)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
