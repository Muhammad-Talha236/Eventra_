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

export default function UserIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("other");
  const [eventId, setEventId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const payload = { title, description, priority, type };
      if (eventId) payload.event = eventId;
      await api.post("/incidents", payload);
      toast.success("Incident reported successfully");
      setTitle(""); 
      setDescription(""); 
      setPriority("medium"); 
      setType("other"); 
      setEventId("");
      setErrors({});
      fetchMyIncidents();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Failed to report incident"); 
    }
    finally { setSubmitting(false); }
  };

  const selectCls = "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 text-[14px] text-[var(--ev-text)]";
  const inputCls = "mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)] text-[var(--ev-text)]";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Report an Issue</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Let us know about any issues or incidents during the festival.</p>
      </div>

      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">New Incident Report</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-[13px] text-[var(--ev-muted)]">Title *</Label>
            <Input 
              className={inputCls}
              placeholder="e.g. Lost ticket, injured person, equipment malfunction" 
              required 
              value={title} 
              onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({...errors, title: ""}); }} 
            />
            {errors.title && <p className="mt-1 text-[12px] text-[var(--ev-danger)]">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-[13px] text-[var(--ev-muted)]">Type</Label>
              <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="security">Security</option>
                <option value="crowd">Crowd</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-[13px] text-[var(--ev-muted)]">Priority</Label>
              <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <Label className="text-[13px] text-[var(--ev-muted)]">Event (optional)</Label>
              <select className={selectCls} value={eventId} onChange={(e) => setEventId(e.target.value)}>
                <option value="">Not tied to an event</option>
                {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-[13px] text-[var(--ev-muted)]">Details *</Label>
            <Textarea 
              className="mt-1.5 rounded-[10px] bg-[var(--ev-elevated)] border-[var(--ev-border)] text-[var(--ev-text)]" 
              rows={4} 
              placeholder="Describe what happened, when, and where..."
              required 
              value={description} 
              onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors({...errors, description: ""}); }} 
            />
            {errors.description && <p className="mt-1 text-[12px] text-[var(--ev-danger)]">{errors.description}</p>}
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">Your Reports</h3>
        {loading ? (
          <LoadingState message="Loading reports..." />
        ) : incidents.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No reports yet" description="Report an incident using the form above to help us provide better support." />
        ) : (
          <div className="space-y-2">
            {incidents.map((inc) => (
              <div key={inc._id} className="flex items-start gap-3 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-4 hover:border-[var(--ev-accent-border)] transition-all">
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${priorityIcon(inc.priority)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-[var(--ev-text)]">{inc.title}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${statusBadge(inc.status)}`}>
                      {inc.status.replace('_', ' ')}
                    </span>
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
