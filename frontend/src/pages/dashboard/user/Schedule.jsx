import { Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { adaptEvents } from "@/lib/eventAdapter";
import api from "@/api/axios";

export default function Schedule() {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get("/registrations/my");
        const events = res.data.filter((r) => r.event).map((r) => adaptEvents([r.event])[0]);
        setMyEvents(events);
      } catch {}
      finally { setLoading(false); }
    };
    fetchSchedule();
  }, []);

  // Group by date
  const dateMap = {};
  myEvents.forEach((e) => { if (e.date) { if (!dateMap[e.date]) dateMap[e.date] = []; dateMap[e.date].push(e); } });
  const days = Object.keys(dateMap).sort();

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading schedule...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">My Schedule</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Your personal event plan.</p>
      </div>
      {days.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-[var(--ev-muted)]">No events in your schedule yet. Register for events to build your plan!</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {days.map((day, i) => (
            <div key={day} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
              <div className="mb-4 flex items-baseline gap-2">
                <p className="text-[22px] font-bold text-[var(--ev-accent)]">Day {i + 1}</p>
                <p className="text-[13px] text-[var(--ev-muted)]">{day}</p>
              </div>
              <div className="space-y-3">
                {dateMap[day].map((e) => (
                  <div key={e.id} className="rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] p-3">
                    <p className="flex items-center gap-1 text-[12px] text-[var(--ev-muted)]"><Clock className="h-3 w-3" />{e.time}</p>
                    <p className="mt-1 text-[13px] font-semibold text-[var(--ev-text)]">{e.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--ev-muted)]"><MapPin className="h-3 w-3" />{e.venue}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
