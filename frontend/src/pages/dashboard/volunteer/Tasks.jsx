import { Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { toast } from "sonner";

export default function VolunteerTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/my");
      setTasks(res.data.map((t) => ({
        id: t._id, title: t.title, venue: t.event?.venue || "N/A",
        due: t.deadline || "No deadline",
        status: t.status === "in_progress" ? "in-progress" : t.status,
        priority: t.priority,
      })));
    } catch { toast.error("Failed to load tasks"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatus = async (id, s) => {
    try {
      await api.put(`/tasks/${id}/status`, { status: s });
      toast.success(s === "completed" ? "Completed!" : "Started!");
      fetchTasks();
    } catch { toast.error("Failed"); }
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Assigned Tasks</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Tasks assigned to you.</p>
      </div>
      <div className="flex gap-2">
        {["all","pending","in-progress","completed"].map((p) => (
          <button key={p} onClick={() => setFilter(p)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium ${filter === p ? "bg-[var(--ev-accent)] text-white" : "bg-[var(--ev-border)] text-[var(--ev-muted)] hover:text-[var(--ev-text)]"}`}>
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-[var(--ev-muted)]">No tasks assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5 flex flex-col gap-4 md:flex-row md:items-center hover:border-[var(--ev-accent-border)] transition-all">
              <div className="flex-1">
                <div className="flex gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${t.priority==="high"?"bg-[var(--ev-danger-bg)] text-[var(--ev-danger)]":"bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]"}`}>{t.priority}</span>
                  <span className="rounded-full px-3 py-1 text-[11px] font-medium bg-[var(--ev-border)] text-[var(--ev-muted)]">{t.status}</span>
                </div>
                <p className="mt-2 text-[15px] font-bold text-[var(--ev-text)]">{t.title}</p>
                <div className="mt-1 flex gap-4 text-[13px] text-[var(--ev-muted)]">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{t.venue}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5"/>{t.due}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleStatus(t.id,"in_progress")} className="h-8 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-lg text-[13px]">Start</Button>
                <Button size="sm" onClick={() => handleStatus(t.id,"completed")} className="h-8 bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-lg text-[13px]">Complete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
