import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState, EmptyState } from "@/components/SharedUI";
import { timeAgo } from "@/lib/formatDate";
import api from "@/api/axios";
import { toast } from "sonner";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch { toast.error("Failed to load notifications"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch { toast.error("Failed"); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <LoadingState message="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Notifications</h1>
          <p className="mt-1 text-[14px] text-[var(--ev-muted)]">
            Stay up to date with everything UniFest.
            {unreadCount > 0 && <span className="ml-2 text-[var(--ev-accent)]">{unreadCount} unread</span>}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllRead} size="sm" className="border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>
      <div className="max-w-3xl space-y-3">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="You'll see updates about your registrations, payments, and announcements here." />
        ) : notifications.map((n) => (
          <div key={n._id} onClick={() => !n.isRead && markAsRead(n._id)}
            className={`rounded-[14px] border bg-[var(--ev-surface)] p-5 flex items-start gap-4 cursor-pointer transition-all hover:border-[var(--ev-accent-border)] ${!n.isRead ? "border-[var(--ev-accent-border)]" : "border-[var(--ev-border)]"}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${!n.isRead ? "bg-[var(--ev-accent)]" : "bg-[var(--ev-elevated)]"}`}>
              <Bell className={`h-5 w-5 ${!n.isRead ? "text-white" : "text-[var(--ev-muted)]"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-[14px] font-semibold ${!n.isRead ? "text-[var(--ev-text)]" : "text-[var(--ev-muted)]"}`}>{n.title}</p>
                <span className="text-[12px] text-[var(--ev-muted)] shrink-0">{timeAgo(n.createdAt)}</span>
              </div>
              <p className="mt-1 text-[13px] text-[var(--ev-muted)]">{n.message}</p>
            </div>
            {!n.isRead && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ev-accent)]" />}
          </div>
        ))}
      </div>
    </div>
  );
}
