import { AlertTriangle, CheckCircle2, Clock, ClipboardList, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";

const priorityColors = { high: "text-[var(--ev-danger)]", medium: "text-[var(--ev-warning)]", low: "text-[var(--ev-muted)]", critical: "text-[var(--ev-danger)]" };
const statusBadge = (s) => {
  if (s === "completed") return "bg-[var(--ev-success-bg)] text-[var(--ev-success)]";
  if (s === "in_progress" || s === "in-progress") return "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]";
  if (s === "resolved") return "bg-[var(--ev-success-bg)] text-[var(--ev-success)]";
  return "bg-[var(--ev-border)] text-[var(--ev-muted)]";
};

export default function VolunteerProfile() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, incidentsRes] = await Promise.all([
          api.get("/tasks/my"),
          api.get("/incidents/my"),
        ]);
        setTasks(tasksRes.data);
        setIncidents(incidentsRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading profile...</div>;

  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[14px] border border-[var(--ev-success-border)] bg-[var(--ev-success-bg-subtle)] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--ev-success)]">
            <Shield className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-bold text-[var(--ev-text)]">{user?.name}</h1>
              <span className="rounded-full bg-[var(--ev-success-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--ev-success)] border border-[var(--ev-success-border)]">Volunteer</span>
            </div>
            <p className="mt-1 text-[14px] text-[var(--ev-muted)]">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5">
          <div className="flex items-center gap-2 text-[var(--ev-muted)]"><ClipboardList className="h-4 w-4" /><span className="text-[13px]">Total Tasks</span></div>
          <p className="mt-2 text-[24px] font-bold text-[var(--ev-text)]">{tasks.length}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5">
          <div className="flex items-center gap-2 text-[var(--ev-muted)]"><CheckCircle2 className="h-4 w-4" /><span className="text-[13px]">Completed</span></div>
          <p className="mt-2 text-[24px] font-bold text-[var(--ev-success)]">{completed}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5">
          <div className="flex items-center gap-2 text-[var(--ev-muted)]"><Clock className="h-4 w-4" /><span className="text-[13px]">Pending</span></div>
          <p className="mt-2 text-[24px] font-bold text-[var(--ev-warning)]">{pending}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5">
          <div className="flex items-center gap-2 text-[var(--ev-muted)]"><AlertTriangle className="h-4 w-4" /><span className="text-[13px]">Incidents Filed</span></div>
          <p className="mt-2 text-[24px] font-bold text-[var(--ev-danger)]">{incidents.length}</p>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">Assigned Tasks</h3>
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[var(--ev-muted)]">No tasks assigned to you yet.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t._id} className="flex items-center justify-between rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--ev-text)]">{t.title}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-[12px] text-[var(--ev-muted)]">
                    {t.event?.title && <span>Event: {t.event.title}</span>}
                    {t.deadline && <span>Due: {t.deadline}</span>}
                    <span className={priorityColors[t.priority] || "text-[var(--ev-muted)]"}>{t.priority} priority</span>
                  </div>
                </div>
                <span className={`shrink-0 ml-3 rounded-full px-3 py-1 text-[11px] font-medium ${statusBadge(t.status)}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Team / Coordinator */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-[var(--ev-accent)]" />
            <h3 className="text-[16px] font-bold text-[var(--ev-text)]">Your Team</h3>
          </div>
          <p className="text-[13px] text-[var(--ev-muted)]">Contact your staff coordinator for team details and shift assignments.</p>
        </div>
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[var(--ev-accent)]" />
            <h3 className="text-[16px] font-bold text-[var(--ev-text)]">Your Coordinator</h3>
          </div>
          <p className="text-[13px] text-[var(--ev-muted)]">Your assigned coordinator will contact you with event-day instructions and updates.</p>
        </div>
      </div>

      {/* My Incident Reports */}
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">My Incident Reports</h3>
        {incidents.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[var(--ev-muted)]">You haven't filed any incident reports yet.</p>
        ) : (
          <div className="space-y-2">
            {incidents.map((i) => (
              <div key={i._id} className="flex items-center justify-between rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${i.priority === "high" || i.priority === "critical" ? "text-[var(--ev-danger)]" : i.priority === "medium" ? "text-[var(--ev-warning)]" : "text-[var(--ev-muted)]"}`} />
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--ev-text)]">{i.title}</p>
                    <p className="text-[12px] text-[var(--ev-muted)]">{i.type} · {new Date(i.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${statusBadge(i.status)}`}>
                  {i.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
