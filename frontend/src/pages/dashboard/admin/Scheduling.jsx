import React, { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { AlertTriangle, CalendarClock, ClipboardList, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalOverlay, ConfirmModal, LoadingState, EmptyState, Pagination } from "@/components/SharedUI";
import { formatDate } from "@/lib/formatDate";
import api from "@/api/axios";

const PER_PAGE = 15;

const priorityBadge = (p) => {
  if (p === 'high') return 'bg-[var(--ev-danger-bg)] text-[var(--ev-danger)] border border-[var(--ev-danger-border)]';
  if (p === 'medium') return 'bg-[var(--ev-warning-bg)] text-[var(--ev-warning)] border border-[var(--ev-warning-bg)]';
  return 'bg-[var(--ev-success-bg)] text-[var(--ev-success)] border border-[var(--ev-success-border)]';
};

const statusBadge = (s) => {
  if (s === 'completed') return 'bg-[var(--ev-success-bg)] text-[var(--ev-success)] border border-[var(--ev-success-border)]';
  if (s === 'in_progress') return 'bg-[var(--ev-info-bg)] text-[var(--ev-info)] border border-[var(--ev-info-border)]';
  return 'bg-[var(--ev-border)] text-[var(--ev-muted)]';
};

/* ── Create Task Modal ── */
function CreateTaskModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', event: '', deadline: '', priority: 'medium' });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users?role=staff,volunteer').then(r => setUsers(r.data)).catch(() => {});
    api.get('/events').then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.assignedTo) { setError('Please select a user to assign'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.event) delete payload.event;
      await api.post('/tasks', payload);
      toast.success('Task created!');
      onCreated();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create task'); }
    finally { setSaving(false); }
  };

  const inputCls = "mt-1.5 h-10 bg-[var(--ev-elevated)] border-[var(--ev-border)] text-[var(--ev-text)]";
  const selectCls = "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 text-[14px] text-[var(--ev-text)]";

  return (
    <ModalOverlay onClose={onClose}>
      <div className="max-h-[85vh] overflow-y-auto rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-[var(--ev-text)]">Create Task</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-[var(--ev-muted)] hover:text-[var(--ev-text)]"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Title *</Label>
            <Input value={form.title} onChange={set('title')} required placeholder="e.g. Set up stage lighting" className={inputCls} /></div>
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Description</Label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Task details..."
              className="mt-1.5 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3 text-[14px] text-[var(--ev-text)] placeholder:text-[var(--ev-muted)]" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Assign To *</Label>
              <select value={form.assignedTo} onChange={set('assignedTo')} required className={selectCls}>
                <option value="">Select user...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select></div>
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Event (optional)</Label>
              <select value={form.event} onChange={set('event')} className={selectCls}>
                <option value="">No event</option>
                {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Deadline</Label>
              <Input type="date" value={form.deadline} onChange={set('deadline')} className={inputCls} /></div>
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Priority</Label>
              <select value={form.priority} onChange={set('priority')} className={selectCls}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select></div>
          </div>
          {error && (<div className="flex items-center gap-2 rounded-[10px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--ev-danger)]" /><p className="text-[13px] text-[var(--ev-danger)]">{error}</p></div>)}
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} disabled={saving} className="flex-1 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create Task'}</Button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

/* ── Main ── */
export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'updated'}`);
      fetchTasks();
    } catch { toast.error('Failed to update status'); }
  };

  const isOverdue = (task) => {
    if (!task.deadline || task.status === 'completed') return false;
    return new Date(task.deadline) < new Date();
  };

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <LoadingState message="Loading tasks..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Task Management</h1>
          <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Create, assign and track tasks for your team.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px] px-5">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ev-muted)]" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search tasks..." className="bg-[var(--ev-surface)] border-[var(--ev-border)] pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] px-3 text-[14px] text-[var(--ev-text)]">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] px-3 text-[14px] text-[var(--ev-text)]">
          <option value="all">All Priorities</option>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tasks found"
          description={search || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first task to get started!'}
          action={<Button onClick={() => setShowCreate(true)} className="bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]"><Plus className="mr-2 h-4 w-4" /> Create Task</Button>} />
      ) : (
        <>
          <p className="text-[13px] text-[var(--ev-muted)]">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
          <div className="rounded-[14px] border border-[var(--ev-border)] overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr className="bg-[var(--ev-elevated)] text-left">
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Task</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Assigned To</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Event</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Deadline</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Priority</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Status</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Actions</th>
              </tr></thead>
              <tbody>{paginated.map(task => (
                <tr key={task._id} className={`border-t border-[var(--ev-border)] bg-[var(--ev-surface)] hover:bg-[var(--ev-hover)] transition-colors ${isOverdue(task) ? 'border-l-2 border-l-[var(--ev-danger)]' : ''}`}>
                  <td className="px-5 py-4">
                    <p className={`text-[14px] font-semibold ${isOverdue(task) ? 'text-[var(--ev-danger)]' : 'text-[var(--ev-text)]'}`}>{task.title}</p>
                    {isOverdue(task) && <span className="text-[11px] text-[var(--ev-danger)]">Overdue</span>}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{task.assignedTo?.name || 'Unassigned'}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{task.event?.title || '—'}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{task.deadline ? formatDate(task.deadline) : '—'}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[12px] font-medium ${priorityBadge(task.priority)}`}>{task.priority}</span></td>
                  <td className="px-5 py-4">
                    <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-[12px] font-medium border-0 cursor-pointer ${statusBadge(task.status)}`}>
                      <option value="pending">pending</option><option value="in_progress">in_progress</option><option value="completed">completed</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(task)}
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

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchTasks(); }} />}

      {deleteTarget && (
        <ConfirmModal title="Delete Task" message={<>Delete task <span className="font-semibold text-[var(--ev-text)]">"{deleteTarget.title}"</span>? This cannot be undone.</>}
          confirmLabel="Delete" variant="danger" icon={Trash2}
          onConfirm={async () => { await api.delete(`/tasks/${deleteTarget._id}`); toast.success('Task deleted'); setDeleteTarget(null); fetchTasks(); }}
          onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
