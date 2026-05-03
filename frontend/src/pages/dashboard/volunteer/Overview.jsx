import { AlertTriangle, ClipboardList, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import api from "@/api/axios";

export default function VolunteerOverview() {
  const [tasks, setTasks] = useState([]);
  const [incidentCount, setIncidentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, incidentsRes] = await Promise.all([
          api.get("/tasks/my"),
          api.get("/incidents/my"),
        ]);
        setTasks(tasksRes.data.map((t) => ({
          id: t._id, title: t.title, venue: t.event?.venue || "N/A",
          due: t.deadline || "No deadline",
          status: t.status === "in_progress" ? "in-progress" : t.status,
        })));
        setIncidentCount(incidentsRes.data.filter((i) => i.status === "open").length);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Volunteer Hub</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Your shift, tasks and reporting.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Tasks" value={tasks.length} delta={`${tasks.filter((t) => t.status === "pending").length} pending`} icon={ClipboardList} />
        <StatCard label="Hours Logged" value="—" icon={Clock} />
        <StatCard label="Venue" value="—" icon={MapPin} />
        <StatCard label="Open Incidents" value={incidentCount} icon={AlertTriangle} />
      </div>
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">Today's Tasks</h3>
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[var(--ev-muted)]">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-4">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--ev-text)]">{task.title}</p>
                  <p className="text-[12px] text-[var(--ev-muted)]">{task.venue} · {task.due}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  task.status === "completed" ? "bg-[var(--ev-success-bg)] text-[var(--ev-success)]" :
                  task.status === "in-progress" ? "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]" :
                  "bg-[var(--ev-border)] text-[var(--ev-muted)]"
                }`}>{task.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
