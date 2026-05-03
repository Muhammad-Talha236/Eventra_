import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import api from "@/api/axios";
import { formatDateTime } from "@/lib/formatDate";

export default function TeamRegistrations() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    api.get("/teams").then(res => setTeams(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Team Registrations</h1>
      <p className="text-[14px] text-[var(--ev-muted)]">View all registered teams across competitions.</p>

      <div className="rounded-[14px] border border-[var(--ev-border)] overflow-x-auto bg-[var(--ev-surface)]">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[var(--ev-elevated)] text-left">
              <th className="px-5 py-3 text-[12px] font-semibold uppercase text-[var(--ev-muted)]">Team</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase text-[var(--ev-muted)]">Competition</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase text-[var(--ev-muted)]">Captain</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase text-[var(--ev-muted)]">Members</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase text-[var(--ev-muted)]">Total Fee</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase text-[var(--ev-muted)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t._id} className="border-t border-[var(--ev-border)] hover:bg-[var(--ev-hover)]">
                <td className="px-5 py-4 text-[14px] font-semibold text-[var(--ev-text)]">{t.name}</td>
                <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{t.event?.title || "Unknown"}</td>
                <td className="px-5 py-4 text-[13px] text-[var(--ev-text)]">{t.captain?.name}</td>
                <td className="px-5 py-4 text-[13px] text-[var(--ev-text)] flex items-center gap-1"><Users className="h-3 w-3" /> {t.members?.length}</td>
                <td className="px-5 py-4 text-[13px] text-[var(--ev-text)]">PKR {(t.totalFee || 0).toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[var(--ev-accent-bg)] px-2 py-1 text-[11px] font-medium text-[var(--ev-accent)]">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {teams.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-sm text-[var(--ev-muted)]">No teams registered.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}