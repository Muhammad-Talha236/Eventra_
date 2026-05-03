import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState, EmptyState } from "@/components/SharedUI";
import { timeAgo } from "@/lib/formatDate";
import api from "@/api/axios";
import { toast } from "sonner";

const priorityIcon = (p) => {
  if (p === "high" || p === "critical") return "text-[var(--ev-danger)]";
  if (p === "medium") return "text-[var(--ev-warning)]";
  return "text-[var(--ev-muted)]";
};

const statusBadge = (s) => {
  if (s === "resolved") return "bg-[var(--ev-success-bg)] text-[var(--ev-success)]";
  if (s === "in_progress") return "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]";
  return "bg-[var(--ev-border)] text-[var(--ev-muted)]";
};

export default function VolunteerIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("other");
  const [eventId, setEventId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMyIncidents = async () => {
    try {
      const res = await api.get("/incidents/my");
      setIncidents(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMyIncidents();
    api.get("/events").then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!description.trim()) { toast.error("Description is required"); return; }
    setSubmitting(true);
    try {
      const payload = { title, description, priority, type };
      if (eventId) payload.event = eventId;
      await api.post("/incidents", payload);
      toast.success("Incident reported.");
      setTitle(""); setDescription(""); setPriority("medium"); setType("other"); setEventId("");
      fetchMyIncidents();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const selectCls = "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 text-[14px] text-[var(--ev-text)]";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Incident Reporting</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">File a new incident or view your reports.</p>
      </div>
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">New Incident</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Title *</Label>
            <Input className="mt-1.5 bg-[var(--ev-elevated)] border-[var(--ev-border)]" placeholder="e.g. Sound issue at main stage" required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Type</Label>
              <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="security">Security</option><option value="crowd">Crowd</option><option value="medical">Medical</option><option value="other">Other</option>
              </select></div>
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Priority</Label>
              <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select></div>
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Event (optional)</Label>
              <select className={selectCls} value={eventId} onChange={(e) => setEventId(e.target.value)}>
                <option value="">No event</option>
                {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
              </select></div>
          </div>
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Details *</Label>
            <Textarea className="mt-1.5 bg-[var(--ev-elevated)] border-[var(--ev-border)]" rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <Button type="submit" disabled={submitting} className="w-full bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
            {submitting ? "Submitting..." : "Submit Report"}</Button>
        </form>
      </div>
      <div>
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">My Reports</h3>
        {loading ? <LoadingState message="Loading..." /> :
         incidents.length === 0 ? <EmptyState icon={AlertTriangle} title="No incidents reported yet" description="Submit an incident report using the form above." /> : (
          <div className="space-y-2">
            {incidents.map((inc) => (
              <div key={inc._id} className="flex items-start gap-3 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-4 hover:border-[var(--ev-accent-border)] transition-all">
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${priorityIcon(inc.priority)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-[var(--ev-text)]">{inc.title}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(inc.status)}`}>{inc.status}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-[var(--ev-muted)]">
                    {inc.type} · {inc.priority} priority · {timeAgo(inc.createdAt)}
                    {inc.event?.title && <> · {inc.event.title}</>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
