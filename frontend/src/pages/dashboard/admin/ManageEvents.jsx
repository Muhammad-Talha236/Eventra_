import React, { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { AlertTriangle, Check, Circle, Loader2, Pencil, Plus, Trash2, Search, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalOverlay, ConfirmModal, LoadingState, EmptyState, Pagination } from "@/components/SharedUI";
import { formatDate, formatDateTime } from "@/lib/formatDate";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";

const PER_PAGE = 15;

/* ── Event Registrations Modal ── */
function EventRegistrationsModal({ event, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [summary, setSummary] = useState({ total: 0, verified: 0, pending: 0, attended: 0 });
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await api.get(`/registrations/event/${event._id}`);
      setRegistrations(res.data.registrations || res.data);
      if (res.data.summary) setSummary(res.data.summary);
    } catch { toast.error("Failed to load registrations"); }
    finally { setLoading(false); }
  }, [event._id]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const toggleAttendance = async (regId) => {
    try {
      await api.put(`/registrations/${regId}/attendance`);
      toast.success("Attendance updated");
      fetchRegistrations();
    } catch { toast.error("Failed to update attendance"); }
  };

  const statusBadge = (s) => {
    if (s === 'verified' || s === 'free') return "bg-[var(--ev-success-bg)] text-[var(--ev-success)] border border-[var(--ev-success-border)]";
    if (s === 'rejected') return "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)] border border-[var(--ev-danger-border)]";
    return "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)] border border-[var(--ev-warning-bg)]";
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-[var(--ev-text)]">Registrations</h3>
            <p className="text-[13px] text-[var(--ev-muted)]">{event.title}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[var(--ev-muted)] hover:text-[var(--ev-text)]"><X className="h-5 w-5" /></button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total", value: summary.total, color: "text-[var(--ev-accent)]" },
            { label: "Verified", value: summary.verified, color: "text-[var(--ev-success)]" },
            { label: "Pending", value: summary.pending, color: "text-[var(--ev-warning)]" },
            { label: "Attended", value: summary.attended, color: "text-[var(--ev-info)]" },
          ].map(s => (
            <div key={s.label} className="rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3 text-center">
              <p className={`text-[20px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-[var(--ev-muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-8 text-center text-[var(--ev-muted)]">Loading...</div>
        ) : registrations.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[var(--ev-muted)]">No registrations for this event yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-[var(--ev-border)]">
            <table className="w-full min-w-[500px]">
              <thead><tr className="bg-[var(--ev-elevated)] text-left">
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">User</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Ticket</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Payment</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Date</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Attended</th>
              </tr></thead>
              <tbody>{registrations.map(r => (
                <tr key={r._id} className="border-t border-[var(--ev-border)] bg-[var(--ev-surface)]">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-[var(--ev-text)]">{r.user?.name || "Unknown"}</p>
                    <p className="text-[11px] text-[var(--ev-muted)]">{r.user?.email || ""}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--ev-accent)]">{r.ticketId}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(r.paymentStatus)}`}>{r.paymentStatus}</span></td>
                  <td className="px-4 py-3 text-[12px] text-[var(--ev-muted)]">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAttendance(r._id)} className="flex items-center gap-1.5 text-[12px] font-medium transition-colors"
                      title={r.attended ? "Mark as not attended" : "Mark as attended"}>
                      {r.attended ? (
                        <><Check className="h-4 w-4 text-[var(--ev-success)]" /><span className="text-[var(--ev-success)]">Yes</span></>
                      ) : (
                        <><Circle className="h-4 w-4 text-[var(--ev-muted)]" /><span className="text-[var(--ev-muted)]">No</span></>
                      )}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

/* ── Edit event modal ── */
const emptyForm = { title: '', description: '', category: 'other', venue: '', date: '', startTime: '', endTime: '', capacity: '', fee: '', banner: '', status: 'upcoming' };

function EditModal({ event, onClose, onSaved }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '', description: event.description || '', category: event.category || 'other',
        venue: event.venue || '', date: event.date ? event.date.slice(0, 10) : '', startTime: event.startTime || '',
        endTime: event.endTime || '', capacity: event.capacity || '', fee: event.fee || 0,
        banner: event.banner || '', status: event.status || 'upcoming',
      });
    }
  }, [event]);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.put(`/events/${event._id}`, { ...form, fee: Number(form.fee) || 0, capacity: Number(form.capacity) || 100 });
      toast.success("Event updated"); onSaved();
    } catch (err) { setError(err.response?.data?.message || "Failed to save changes."); }
    finally { setSaving(false); }
  };

  const inputCls = "mt-1.5 h-10 bg-[var(--ev-elevated)] border-[var(--ev-border)] text-[var(--ev-text)]";
  const selectCls = "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 text-[14px] text-[var(--ev-text)]";

  return (
    <ModalOverlay onClose={onClose}>
      <div className="max-h-[85vh] overflow-y-auto rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-[var(--ev-text)]">Edit Event</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-[var(--ev-muted)] hover:text-[var(--ev-text)]"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Title</Label><Input value={form.title} onChange={set("title")} required className={inputCls} /></div>
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Description</Label>
            <textarea value={form.description} onChange={set("description")} rows={3} className="mt-1.5 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3 text-[14px] text-[var(--ev-text)] placeholder:text-[var(--ev-muted)]" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Date</Label><Input type="date" value={form.date} onChange={set("date")} required className={inputCls} /></div>
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Venue</Label><Input value={form.venue} onChange={set("venue")} required className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Start Time</Label><Input type="time" value={form.startTime} onChange={set("startTime")} className={inputCls} /></div>
            <div><Label className="text-[13px] text-[var(--ev-muted)]">End Time</Label><Input type="time" value={form.endTime} onChange={set("endTime")} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Category</Label>
              <select value={form.category} onChange={set("category")} className={selectCls}>
                <option value="seminar">Seminar</option><option value="workshop">Workshop</option>
                <option value="sports">Sports</option><option value="cultural">Cultural</option>
                <option value="tech">Tech</option><option value="concert">Concert</option>
                <option value="esports">E-Sports</option><option value="other">Other</option>
              </select></div>
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Capacity</Label><Input type="number" value={form.capacity} onChange={set("capacity")} className={inputCls} /></div>
            <div><Label className="text-[13px] text-[var(--ev-muted)]">Fee (0 = free)</Label><Input type="number" value={form.fee} onChange={set("fee")} className={inputCls} /></div>
          </div>
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Status</Label>
            <select value={form.status} onChange={set("status")} className={selectCls}>
              <option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select></div>
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Banner URL</Label><Input value={form.banner} onChange={set("banner")} placeholder="https://..." className={inputCls} /></div>
          {error && (<div className="flex items-center gap-2 rounded-[10px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--ev-danger)]" /><p className="text-[13px] text-[var(--ev-danger)]">{error}</p></div>)}
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} disabled={saving} className="flex-1 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}</Button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

/* ── Main page ── */
export default function ManageEvents() {
  const { user: me } = useAuth();
  const isStaff = me?.role === 'staff';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', venue: '', startTime: '', endTime: '', fee: '', category: 'other', capacity: '', banner: '', status: 'upcoming'
  });
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [regsTarget, setRegsTarget] = useState(null);
  const [page, setPage] = useState(1);

  const fetchEvents = useCallback(async () => {
    try { const res = await api.get('/events'); setEvents(res.data); }
    catch { toast.error("Failed to fetch events"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSaving(true); setFormError("");
    if (!formData.title.trim()) { setFormError("Title is required"); setFormSaving(false); return; }
    if (!formData.date) { setFormError("Date is required"); setFormSaving(false); return; }
    if (!formData.venue.trim()) { setFormError("Venue is required"); setFormSaving(false); return; }
    try {
      await api.post('/events', { ...formData, fee: Number(formData.fee) || 0, capacity: Number(formData.capacity) || 100 });
      toast.success("Event created!"); setShowForm(false);
      setFormData({ title: '', description: '', date: '', venue: '', startTime: '', endTime: '', fee: '', category: 'other', capacity: '', banner: '', status: 'upcoming' });
      fetchEvents();
    } catch (err) { setFormError(err.response?.data?.message || "Creation failed"); }
    finally { setFormSaving(false); }
  };

  const filtered = events.filter((e) => e.title?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <LoadingState message="Loading events..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Manage Events</h1>
          <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Create, edit and manage all events.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px] px-5">
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6 space-y-4">
          <Input placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
          <textarea className="w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3 text-[14px] text-[var(--ev-text)] placeholder:text-[var(--ev-muted)]" placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
            <Input placeholder="Venue" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} required className="bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="time" placeholder="Start Time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
            <Input type="time" placeholder="End Time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <select className="rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 py-2 text-[14px] text-[var(--ev-text)]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="seminar">Seminar</option><option value="workshop">Workshop</option><option value="sports">Sports</option>
              <option value="cultural">Cultural</option><option value="tech">Tech</option><option value="concert">Concert</option>
              <option value="esports">E-Sports</option><option value="other">Other</option>
            </select>
            <Input type="number" placeholder="Capacity" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
            <Input type="number" placeholder="Fee (0=free)" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} className="bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select className="rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 py-2 text-[14px] text-[var(--ev-text)]" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
            <Input placeholder="Banner URL (optional)" value={formData.banner} onChange={e => setFormData({...formData, banner: e.target.value})} className="bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
          </div>
          {formError && (<div className="flex items-center gap-2 rounded-[10px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--ev-danger)]" /><p className="text-[13px] text-[var(--ev-danger)]">{formError}</p></div>)}
          <Button type="submit" disabled={formSaving} className="w-full bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
            {formSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : "Save Event"}</Button>
        </form>
      )}

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ev-muted)]" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search events..." className="bg-[var(--ev-surface)] border-[var(--ev-border)] pl-9" />
        </div>
        <span className="text-[13px] text-[var(--ev-muted)]">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Plus} title="No events found" description={search ? "Try a different search." : "Create your first event to get started!"} />
      ) : (
        <>
          <div className="rounded-[14px] border border-[var(--ev-border)] overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead><tr className="bg-[var(--ev-elevated)] text-left">
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Event</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Date</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Venue</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Category</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Reg.</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Actions</th>
              </tr></thead>
              <tbody>{paginated.map((event) => (
                <tr key={event._id} className="border-t border-[var(--ev-border)] bg-[var(--ev-surface)] hover:bg-[var(--ev-hover)] transition-colors">
                  <td className="px-5 py-4 text-[14px] font-semibold text-[var(--ev-text)]">{event.title}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{formatDate(event.date)}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{event.venue}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[var(--ev-accent-bg)] px-3 py-1 text-[12px] font-medium text-[var(--ev-accent)] border border-[var(--ev-accent-border)]">{event.category}</span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-text)]">{event.registeredCount || 0}/{event.capacity}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setRegsTarget(event)} title="View Registrations"
                        className="text-[var(--ev-info)] hover:bg-[var(--ev-info-bg)] hover:text-[var(--ev-info)]">
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget(event)}
                        className="text-[var(--ev-accent)] hover:bg-[var(--ev-accent-bg-subtle)] hover:text-[var(--ev-accent)]">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!isStaff && (
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(event)}
                          className="text-[var(--ev-danger)] hover:bg-[var(--ev-danger-bg-subtle)] hover:text-[var(--ev-danger)]">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmModal title="Delete Event"
          message={<>Are you sure you want to delete <span className="font-semibold text-[var(--ev-text)]">{deleteTarget.title}</span>? This action cannot be undone.</>}
          confirmLabel="Delete" variant="danger" icon={Trash2}
          onConfirm={async () => { await api.delete(`/events/${deleteTarget._id}`); toast.success("Event deleted"); setDeleteTarget(null); fetchEvents(); }}
          onClose={() => setDeleteTarget(null)} />
      )}

      {/* Edit event modal */}
      {editTarget && <EditModal event={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); fetchEvents(); }} />}

      {/* Event registrations modal */}
      {regsTarget && <EventRegistrationsModal event={regsTarget} onClose={() => setRegsTarget(null)} />}
    </div>
  );
}
