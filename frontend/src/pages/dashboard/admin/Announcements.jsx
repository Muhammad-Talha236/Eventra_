import { Megaphone, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmModal, LoadingState, EmptyState } from "@/components/SharedUI";
import { timeAgo } from "@/lib/formatDate";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import { toast } from "sonner";

const typeBadge = (type) => {
  if (type === "emergency") return "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)] border border-[var(--ev-danger-border)]";
  if (type === "event") return "bg-[var(--ev-accent-bg)] text-[var(--ev-accent)] border border-[var(--ev-accent-border)]";
  return "bg-[var(--ev-border)] text-[var(--ev-muted)]";
};

export default function Announcements() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("all");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch { toast.error("Failed to load announcements"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!message.trim()) { toast.error("Message is required"); return; }
    setSending(true);
    try {
      await api.post("/announcements", { title, message, targetRole: audience, type });
      toast.success("Announcement sent!");
      setTitle(""); setAudience("all"); setMessage(""); setType("general");
      fetchAnnouncements();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Announcements</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Broadcast updates to the festival community.</p>
      </div>

      {/* Create form — Admin only */}
      {isAdmin && (
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">New Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="a-title" className="text-[13px] text-[var(--ev-muted)]">Title *</Label>
            <Input id="a-title" className="mt-1.5 bg-[var(--ev-elevated)] border-[var(--ev-border)]" placeholder="e.g. Schedule update" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="a-audience" className="text-[13px] text-[var(--ev-muted)]">Audience</Label>
              <select id="a-audience" className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 text-[14px] text-[var(--ev-text)]" value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="all">All</option><option value="admin">Admin</option><option value="staff">Staff</option>
                <option value="volunteer">Volunteers</option><option value="user">Users</option>
              </select>
            </div>
            <div>
              <Label htmlFor="a-type" className="text-[13px] text-[var(--ev-muted)]">Type</Label>
              <select id="a-type" className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 text-[14px] text-[var(--ev-text)]" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="general">General</option><option value="event">Event</option><option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="a-msg" className="text-[13px] text-[var(--ev-muted)]">Message *</Label>
            <Textarea id="a-msg" className="mt-1.5 bg-[var(--ev-elevated)] border-[var(--ev-border)]" rows={4} placeholder="Write your message..." value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <Button type="submit" disabled={sending} className="w-full bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
            {sending ? "Broadcasting..." : "Broadcast"}
          </Button>
        </form>
        </div>
      )}

      {/* Past announcements */}
      <div>
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">Past Announcements</h3>
        {loading ? (
          <LoadingState message="Loading announcements..." />
        ) : announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" description="Create your first announcement to broadcast to the community." />
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a._id} className={`rounded-[14px] border bg-[var(--ev-surface)] p-5 flex items-start gap-4 hover:border-[var(--ev-accent-border)] transition-all ${a.type === "emergency" ? "border-[var(--ev-danger-border)] border-l-4 border-l-[var(--ev-danger)]" : "border-[var(--ev-border)]"}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.type === "emergency" ? "bg-[var(--ev-danger)]" : "bg-[var(--ev-accent)]"}`}>
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold text-[var(--ev-text)]">{a.title}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${typeBadge(a.type)}`}>{a.type}</span>
                    </div>
                    <span className="text-[12px] text-[var(--ev-muted)]">{timeAgo(a.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--ev-muted)]">{a.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="rounded-full bg-[var(--ev-accent-bg)] px-3 py-1 text-[11px] font-medium text-[var(--ev-accent)] border border-[var(--ev-accent-border)]">→ {a.targetRole}</span>
                    {a.createdBy?.name && <span className="text-[11px] text-[var(--ev-muted)]">by {a.createdBy.name}</span>}
                  </div>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(a)}
                    className="shrink-0 text-[var(--ev-danger)] hover:bg-[var(--ev-danger-bg-subtle)] hover:text-[var(--ev-danger)]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal title="Delete Announcement" message={<>Delete announcement <span className="font-semibold text-[var(--ev-text)]">"{deleteTarget.title}"</span>?</>}
          confirmLabel="Delete" variant="danger" icon={Trash2}
          onConfirm={async () => { await api.delete(`/announcements/${deleteTarget._id}`); toast.success("Announcement deleted"); setDeleteTarget(null); fetchAnnouncements(); }}
          onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
