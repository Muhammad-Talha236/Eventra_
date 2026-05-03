import { ClipboardList, LifeBuoy, ScanLine, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import api from "@/api/axios";

export default function StaffOverview() {
  const [stats, setStats] = useState({ pending: 0, incidents: 0, registrations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [regsRes, incidentsRes] = await Promise.all([
          api.get("/registrations/all"),
          api.get("/incidents"),
        ]);
        const data = regsRes.data;
        const regs = data.registrations || data;
        const counts = data.counts || {};
        setStats({
          pending: counts.pending || 0,
          incidents: incidentsRes.data.filter((i) => i.status === "open").length,
          registrations: (Array.isArray(regs) ? regs : []).length,
        });
      } catch {}
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Staff Console</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Quick actions for your shift.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Registrations" value={stats.registrations} icon={ClipboardList} />
        <StatCard label="Pending Payments" value={stats.pending} icon={ShieldCheck} />
        <StatCard label="Scans Today" value="—" icon={ScanLine} />
        <StatCard label="Open Incidents" value={stats.incidents} icon={LifeBuoy} />
      </div>
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">Today's Checklist</h3>
        <ul className="space-y-3">
          {["Open registration desk at 8 AM", "Verify pending payments before noon", "Coordinate with security", "Complete attendance reconciliation by 11 PM"].map((task) => (
            <li key={task} className="flex items-center gap-3 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3">
              <input type="checkbox" className="h-4 w-4 accent-[var(--ev-accent)]" />
              <span className="text-[14px] text-[var(--ev-text)]">{task}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
