import { Megaphone, AlertTriangle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { LoadingState, EmptyState } from "@/components/SharedUI";
import { timeAgo } from "@/lib/formatDate";
import api from "@/api/axios";
import { toast } from "sonner";

const typeBadge = (type) => {
  if (type === "emergency") return "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)] border border-[var(--ev-danger-border)]";
  if (type === "event") return "bg-[var(--ev-accent-bg)] text-[var(--ev-accent)] border border-[var(--ev-accent-border)]";
  return "bg-[var(--ev-border)] text-[var(--ev-muted)]";
};

export default function UserAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch { toast.error("Failed to load announcements"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  if (loading) return <LoadingState message="Loading announcements..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Announcements</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Stay updated with important news and updates.</p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="There are no announcements for you at this time." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const isEmergency = a.type === "emergency";
            return (
              <div
                key={a._id}
                className={`rounded-[14px] border p-5 transition-all ${
                  isEmergency
                    ? "border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] hover:border-[var(--ev-danger)]"
                    : "border-[var(--ev-border)] bg-[var(--ev-surface)] hover:border-[var(--ev-accent-border)]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {isEmergency && (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ev-danger)]">
                      <AlertTriangle className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${typeBadge(a.type)}`}>
                        {a.type === "emergency" ? "🚨 Emergency" : a.type === "event" ? "📅 Event" : "📢 General"}
                      </span>
                      <span className="text-[12px] text-[var(--ev-muted)]">{timeAgo(a.createdAt)}</span>
                      {a.createdBy?.name && (
                        <span className="text-[12px] text-[var(--ev-muted)]">by {a.createdBy.name}</span>
                      )}
                    </div>
                    <h3 className={`mt-2 text-[16px] font-bold ${isEmergency ? "text-[var(--ev-danger)]" : "text-[var(--ev-text)]"}`}>
                      {a.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] text-[var(--ev-muted)] leading-relaxed">{a.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
