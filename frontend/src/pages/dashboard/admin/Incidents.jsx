import { AlertTriangle, Search, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/StatCard";
import { ConfirmModal, LoadingState, EmptyState, Pagination } from "@/components/SharedUI";
import { formatDateTime } from "@/lib/formatDate";
import api from "@/api/axios";
import { toast } from "sonner";

const PER_PAGE = 15;

const priorityColors = {
  low: "bg-[var(--ev-success-bg)] text-[var(--ev-success)] border border-[var(--ev-success-border)]",
  medium: "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)] border border-[var(--ev-warning-bg)]",
  high: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
  critical: "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)] border border-[var(--ev-danger-border)]",
};

const statusColors = {
  open: "bg-[var(--ev-border)] text-[var(--ev-muted)]",
  in_progress: "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)] border border-[var(--ev-warning-bg)]",
  resolved: "bg-[var(--ev-success-bg)] text-[var(--ev-success)] border border-[var(--ev-success-border)]",
};

const typeColors = {
  security: "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)]",
  crowd: "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]",
  medical: "bg-[var(--ev-info-bg)] text-[var(--ev-info)]",
  other: "bg-[var(--ev-border)] text-[var(--ev-muted)]",
};

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await api.get("/incidents");
      setIncidents(res.data);
    } catch { toast.error("Failed to load incidents"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/incidents/${id}/status`, { status });
      toast.success(`Incident ${status === "in_progress" ? "acknowledged" : "resolved"}`);
      fetchIncidents();
    } catch { toast.error("Failed to update"); }
  };

  const filtered = incidents.filter(i => {
    const matchSearch = !search || i.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchPriority = priorityFilter === "all" || i.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const critical = incidents.filter((i) => i.priority === "critical" || i.priority === "high");
  const open = incidents.filter((i) => i.status === "open" || i.status === "in_progress");
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <LoadingState message="Loading incidents..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Incident Reports</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Track and resolve on-ground incidents.</p>
      </div>

      {critical.length > 0 && (
        <div className="rounded-[14px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[var(--ev-danger)]" />
          <p className="text-[14px] font-medium text-[var(--ev-danger)]">{critical.length} critical/high priority incident(s) require attention</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Incidents" value={incidents.length} icon={AlertTriangle} />
        <StatCard label="Open / In Progress" value={open.length} icon={AlertTriangle} trend={open.length > 0 ? "down" : "up"} delta={open.length > 0 ? "needs attention" : "all clear"} />
        <StatCard label="Critical" value={critical.length} icon={AlertTriangle} trend="down" delta={critical.length > 0 ? "urgent" : "none"} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ev-muted)]" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search incidents..." className="bg-[var(--ev-surface)] border-[var(--ev-border)] pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] px-3 text-[14px] text-[var(--ev-text)]">
          <option value="all">All Statuses</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option>
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] px-3 text-[14px] text-[var(--ev-text)]">
          <option value="all">All Priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No incidents found" description={search || statusFilter !== "all" || priorityFilter !== "all" ? "Try adjusting your filters." : "No incidents reported yet."} />
      ) : (
        <>
          <p className="text-[13px] text-[var(--ev-muted)]">{filtered.length} incident{filtered.length !== 1 ? 's' : ''}</p>
          <div className="rounded-[14px] border border-[var(--ev-border)] overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead><tr className="bg-[var(--ev-elevated)] text-left">
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Title</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Type</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Priority</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Reported By</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Event</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Status</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Time</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Actions</th>
              </tr></thead>
              <tbody>{paginated.map(inc => (
                <tr key={inc._id} className="border-t border-[var(--ev-border)] bg-[var(--ev-surface)] hover:bg-[var(--ev-hover)] transition-colors">
                  <td className="px-5 py-4 text-[14px] font-semibold text-[var(--ev-text)]">{inc.title}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[12px] font-medium ${typeColors[inc.type] || typeColors.other}`}>{inc.type}</span></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[12px] font-medium ${priorityColors[inc.priority] || priorityColors.medium}`}>{inc.priority}</span></td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{inc.reportedBy?.name || "Unknown"}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{inc.event?.title || "—"}</td>
                  <td className="px-5 py-4">
                    <select value={inc.status} onChange={(e) => handleStatusUpdate(inc._id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-[12px] font-medium border-0 cursor-pointer ${statusColors[inc.status] || statusColors.open}`}>
                      <option value="open">open</option><option value="in_progress">in_progress</option><option value="resolved">resolved</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[var(--ev-muted)]">{formatDateTime(inc.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(inc)}
                      className="text-[var(--ev-danger)] hover:bg-[var(--ev-danger-bg-subtle)] hover:text-[var(--ev-danger)]">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {deleteTarget && (
        <ConfirmModal title="Delete Incident" message={<>Delete incident <span className="font-semibold text-[var(--ev-text)]">"{deleteTarget.title}"</span>? This cannot be undone.</>}
          confirmLabel="Delete" variant="danger" icon={Trash2}
          onConfirm={async () => { await api.delete(`/incidents/${deleteTarget._id}`); toast.success("Incident deleted"); setDeleteTarget(null); fetchIncidents(); }}
          onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
