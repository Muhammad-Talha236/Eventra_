import { Activity, Calendar, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import api from "@/api/axios";

const chartTooltip = {
  contentStyle: { background: "var(--ev-surface)", border: "1px solid var(--ev-border)", borderRadius: "10px", fontSize: 12 },
  labelStyle: { color: "var(--ev-text)" },
};

const CATEGORY_PALETTE = [
  "hsl(243 75% 59%)", "hsl(265 85% 65%)", "hsl(195 80% 55%)",
  "hsl(280 75% 65%)", "hsl(38 95% 60%)", "hsl(152 70% 50%)",
  "hsl(0 75% 60%)", "hsl(200 60% 50%)", "hsl(330 80% 60%)", "hsl(170 70% 50%)",
];

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/stats");
        setStats(res.data);
      } catch {
        // Stats will remain null, showing empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading analytics...</div>;
  if (!stats) return <div className="py-20 text-center text-[var(--ev-danger)]">Failed to load analytics data.</div>;

  // Build category distribution from API aggregation
  const byCategory = (stats.registrationsByCategory || [])
    .filter((c) => c.count > 0)
    .map((c, i) => ({
      name: c.category || "other",
      value: c.count,
      color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
    }));

  // Top events bar chart data
  const topEventsBarData = (stats.topEvents || []).map((e) => ({
    title: e.title, registered: e.registrations,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Analytics</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Real-time event operations overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Registrations" value={stats.totalRegistrations.toLocaleString()} icon={Users} />
        <StatCard label="Pending Payments" value={stats.pendingPayments} icon={DollarSign} />
        <StatCard label="Total Events" value={stats.totalEvents} icon={Activity} />
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon={Calendar} />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">Top Events by Registrations</h3>
          {topEventsBarData.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[var(--ev-muted)]">No registration data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEventsBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ev-border)" />
                <XAxis dataKey="title" stroke="var(--ev-muted)" fontSize={11} tickFormatter={(v) => v.length > 15 ? `${v.slice(0, 15)}…` : v} />
                <YAxis stroke="var(--ev-muted)" fontSize={12} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="registered" fill="var(--ev-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">By Category</h3>
          {byCategory.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[var(--ev-muted)]">No category data yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={4}>
                    {byCategory.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {byCategory.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-[var(--ev-muted)]">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-semibold text-[var(--ev-text)]">{c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="text-[16px] font-bold text-[var(--ev-text)]">Open Incidents</h3>
          <p className="mt-2 text-[36px] font-bold text-[var(--ev-danger)]">{stats.openIncidents}</p>
          <p className="mt-1 text-[13px] text-[var(--ev-muted)]">Incidents requiring attention</p>
        </div>
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="text-[16px] font-bold text-[var(--ev-text)]">Pending Payments</h3>
          <p className="mt-2 text-[36px] font-bold text-[var(--ev-warning)]">{stats.pendingPayments}</p>
          <p className="mt-1 text-[13px] text-[var(--ev-muted)]">Awaiting verification</p>
        </div>
      </div>
    </div>
  );
}
