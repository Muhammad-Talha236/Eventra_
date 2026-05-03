import { Crown, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api/axios";

export default function Volunteers() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await api.get("/users");
        const users = res.data;
        setStaffMembers(users.filter((u) => u.role === "staff"));
        setVolunteers(users.filter((u) => u.role === "volunteer"));
      } catch {}
      finally { setLoading(false); }
    };
    fetchVolunteers();
  }, []);

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading volunteer data...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Volunteer Management</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Staff coordinators and their assigned volunteers.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5">
          <p className="text-[13px] text-[var(--ev-muted)]">Staff Members</p>
          <p className="mt-1 text-[28px] font-bold text-[var(--ev-info)]">{staffMembers.length}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5">
          <p className="text-[13px] text-[var(--ev-muted)]">Volunteers</p>
          <p className="mt-1 text-[28px] font-bold text-[var(--ev-success)]">{volunteers.length}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5">
          <p className="text-[13px] text-[var(--ev-muted)]">Total Team</p>
          <p className="mt-1 text-[28px] font-bold text-[var(--ev-accent)]">{staffMembers.length + volunteers.length}</p>
        </div>
      </div>

      {/* Staff coordinators with their volunteers */}
      {staffMembers.length === 0 && volunteers.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-[var(--ev-muted)]">No staff or volunteers found.</p>
      ) : (
        <div className="space-y-6">
          {/* Staff section */}
          {staffMembers.length > 0 && (
            <div>
              <h3 className="mb-3 text-[16px] font-bold text-[var(--ev-text)]">Staff Coordinators</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {staffMembers.map((s) => (
                  <div key={s._id} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--ev-info)]">
                      <Crown className="h-5 w-5 text-[var(--ev-text)]" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[var(--ev-text)]">{s.name}</p>
                      <p className="text-[12px] text-[var(--ev-muted)]">{s.email}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-[var(--ev-info-bg)] px-3 py-1 text-[12px] font-medium text-[var(--ev-info)] border border-[var(--ev-info-border)]">Staff</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteers section */}
          {volunteers.length > 0 && (
            <div>
              <h3 className="mb-3 text-[16px] font-bold text-[var(--ev-text)]">Volunteers</h3>
              <div className="grid gap-3 lg:grid-cols-2">
                {volunteers.map((v) => (
                  <div key={v._id} className="flex items-center justify-between rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-4 hover:border-[var(--ev-accent-border)] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ev-success)] text-[11px] font-bold text-black">
                        {v.name.split(" ").map((s) => s[0]).join("")}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--ev-text)]">{v.name}</p>
                        <p className="text-[12px] text-[var(--ev-muted)]">{v.email}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${v.isActive ? "bg-[var(--ev-success-bg)] text-[var(--ev-success)]" : "bg-[var(--ev-border)] text-[var(--ev-muted)]"}`}>
                      {v.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
