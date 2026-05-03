import { AlertTriangle, Loader2, Search, UserPlus, X, Users } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalOverlay, LoadingState, EmptyState, Pagination } from "@/components/SharedUI";
import { formatDate } from "@/lib/formatDate";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import { toast } from "sonner";

const PER_PAGE = 15;

const roleColors = {
  admin: { bg: "bg-[var(--ev-accent-bg)]", text: "text-[var(--ev-accent)]", border: "border-[var(--ev-accent-border)]" },
  staff: { bg: "bg-[var(--ev-info-bg)]", text: "text-[var(--ev-info)]", border: "border-[var(--ev-info-border)]" },
  volunteer: { bg: "bg-[var(--ev-success-bg)]", text: "text-[var(--ev-success)]", border: "border-[var(--ev-success-border)]" },
  user: { bg: "bg-[var(--ev-border)]", text: "text-[var(--ev-muted)]", border: "border-[var(--ev-border)]" },
};

export default function ManageUsers() {
  const { user: me } = useAuth();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "volunteer" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.map((u) => ({
        id: u._id, name: u.name, email: u.email, role: u.role,
        status: u.isActive ? "active" : "inactive",
        joined: u.createdAt,
      })));
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) { setAddError("Name is required"); return; }
    if (!addForm.email.trim()) { setAddError("Email is required"); return; }
    if (!addForm.password || addForm.password.length < 6) { setAddError("Password must be at least 6 characters"); return; }
    setAddLoading(true); setAddError("");
    try {
      await api.post("/users/add-staff", addForm);
      toast.success("Member added!");
      setShowAdd(false);
      setAddForm({ name: "", email: "", password: "", role: "volunteer" });
      fetchUsers();
    } catch (err) { setAddError(err.response?.data?.message || "Failed to add member"); }
    finally { setAddLoading(false); }
  };

  const filtered = users.filter((u) => {
    const matchQuery = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const rc = (role) => roleColors[role] || roleColors.user;

  const roleOptions = me?.role === "admin"
    ? [{ value: "staff", label: "Staff" }, { value: "volunteer", label: "Volunteer" }]
    : [{ value: "volunteer", label: "Volunteer" }];

  if (loading) return <LoadingState message="Loading users..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Manage Users</h1>
          <p className="mt-1 text-[14px] text-[var(--ev-muted)]">All system users across roles.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px] px-5">
          <UserPlus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <ModalOverlay onClose={() => setShowAdd(false)}>
          <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-[var(--ev-text)]">Add New Member</h3>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1 text-[var(--ev-muted)] hover:text-[var(--ev-text)]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div><Label className="text-[13px] text-[var(--ev-muted)]">Full Name *</Label>
                <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required className="mt-1.5 h-10 bg-[var(--ev-elevated)] border-[var(--ev-border)]" /></div>
              <div><Label className="text-[13px] text-[var(--ev-muted)]">Email *</Label>
                <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} required className="mt-1.5 h-10 bg-[var(--ev-elevated)] border-[var(--ev-border)]" /></div>
              <div><Label className="text-[13px] text-[var(--ev-muted)]">Password *</Label>
                <Input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required className="mt-1.5 h-10 bg-[var(--ev-elevated)] border-[var(--ev-border)]" /></div>
              <div><Label className="text-[13px] text-[var(--ev-muted)]">Role</Label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 text-[14px] text-[var(--ev-text)]">
                  {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select></div>
              {addError && (<div className="flex items-center gap-2 rounded-[10px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--ev-danger)]" /><p className="text-[13px] text-[var(--ev-danger)]">{addError}</p></div>)}
              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowAdd(false)} disabled={addLoading}
                  className="flex-1 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">Cancel</Button>
                <Button type="submit" disabled={addLoading}
                  className="flex-1 bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
                  {addLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding…</> : "Add Member"}</Button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* Search & Role Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ev-muted)]" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="bg-[var(--ev-surface)] border-[var(--ev-border)] pl-9" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] px-3 text-[14px] text-[var(--ev-text)]">
          <option value="all">All Roles</option><option value="admin">Admin</option><option value="staff">Staff</option>
          <option value="volunteer">Volunteer</option><option value="user">User</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description={query || roleFilter !== "all" ? "Try adjusting your filters." : "No users in the system yet."} />
      ) : (
        <>
          <p className="text-[13px] text-[var(--ev-muted)]">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
          <div className="rounded-[14px] border border-[var(--ev-border)] overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead><tr className="bg-[var(--ev-elevated)] text-left">
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">User</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Email</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Role</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Status</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Joined</th>
              </tr></thead>
              <tbody>{paginated.map((user) => (
                <tr key={user.id} className="border-t border-[var(--ev-border)] bg-[var(--ev-surface)] hover:bg-[var(--ev-hover)] transition-colors">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ev-accent)] text-[11px] font-semibold text-white">{user.name.split(" ").map((s) => s[0]).join("")}</div><span className="text-[14px] font-semibold text-[var(--ev-text)]">{user.name}</span></div></td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{user.email}</td>
                  <td className="px-5 py-4"><span className={`rounded-full ${rc(user.role).bg} ${rc(user.role).text} border ${rc(user.role).border} px-3 py-1 text-[12px] font-medium`}>{user.role}</span></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[12px] font-medium ${user.status === "active" ? "bg-[var(--ev-success-bg)] text-[var(--ev-success)] border border-[var(--ev-success-border)]" : "bg-[var(--ev-border)] text-[var(--ev-muted)]"}`}>{user.status}</span></td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{formatDate(user.joined)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
