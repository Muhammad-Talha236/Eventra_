import { AlertTriangle, ArrowRight, Bell, Calendar, Ticket, Trophy, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { EventCard } from "@/components/EventCard";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { adaptEvents } from "@/lib/eventAdapter";
import api from "@/api/axios";

export default function UserOverview() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, regsRes] = await Promise.all([
          api.get("/events"),
          api.get("/registrations/my"),
        ]);
        const adapted = adaptEvents(eventsRes.data);
        setEvents(adapted);
        setMyRegs(regsRes.data);

        // Separate active vs rejected registrations
        const active = regsRes.data
          .filter((r) => r.event && r.paymentStatus !== "rejected")
          .map((r) => adaptEvents([r.event])[0]);
        const rejected = regsRes.data
          .filter((r) => r.event && r.paymentStatus === "rejected")
          .map((r) => ({ ...adaptEvents([r.event])[0], _regId: r._id }));

        setMyEvents(active);
        setRejectedEvents(rejected);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Filter out events user is already actively registered for
  const recommended = useMemo(() => {
    const activeRegEventIds = new Set(
      myRegs
        .filter((r) => r.event && r.paymentStatus !== "rejected")
        .map((r) => (typeof r.event === "object" ? r.event._id : r.event))
    );
    return events.filter((e) => !activeRegEventIds.has(e.id));
  }, [events, myRegs]);

  const userName = user?.name?.split(" ")[0] || "User";

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading dashboard...</div>;

  // Marquee speed: ~20s base + 5s per card for smoother feel
  const marqueeSpeed = Math.max(20, recommended.length * 5);

  return (
    <div className="space-y-8">
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Welcome back, <span className="text-[var(--ev-accent)]">{userName}</span></h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Here's what's happening with your festival experience.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Tickets" value={myEvents.length} delta="registered" icon={Ticket} />
        <StatCard label="Upcoming" value={myEvents.filter((e) => e?.status === "upcoming").length} icon={Calendar} />
        <StatCard label="Notifications" value={0} delta="check inbox" icon={Bell} />
        <StatCard label="Loyalty Pts" value="—" icon={Trophy} />
      </div>

      {/* Rejected registrations warning */}
      {rejectedEvents.length > 0 && (
        <div className="rounded-[14px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--ev-danger)]" />
            <p className="text-[14px] font-semibold text-[var(--ev-danger)]">Payment Rejected</p>
          </div>
          {rejectedEvents.map((event) => (
            <div key={event.id} style={{ position: 'relative', paddingRight: '52px' }} className="flex items-center justify-between rounded-[10px] border border-[var(--ev-danger-border)] bg-[var(--ev-bg)] p-3">
              {/* Dismiss button */}
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/registrations/${event._regId}`);
                    setRejectedEvents(prev => prev.filter(r => r._regId !== event._regId));
                  } catch (err) {
                    console.error('Failed to dismiss:', err);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: 1,
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  e.currentTarget.style.color = '#EF4444';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }}
                title="Dismiss"
              >
                ✕
              </button>
              <div>
                <p className="text-[14px] font-semibold text-[var(--ev-text)]">{event.title}</p>
                <p className="text-[12px] text-[var(--ev-muted)]">Your payment was rejected. Please re-register to try again.</p>
              </div>
              <Link to={`/events/${event.id}`} className="shrink-0 rounded-lg bg-[var(--ev-accent)] px-4 py-2 text-[12px] font-medium text-white hover:bg-[var(--ev-accent-hover)]">
                Re-register
              </Link>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[var(--ev-text)]">Your Registered Events</h2>
          <Link to="/dashboard/registrations" className="inline-flex items-center gap-1 text-[13px] text-[var(--ev-muted)] hover:text-[var(--ev-text)] transition-colors">View all <ArrowRight className="h-3 w-3" /></Link>
        </div>
        {myEvents.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-[var(--ev-muted)]">You haven't registered for any events yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myEvents.map((event, i) => event && <EventCard key={event.id} event={event} index={i} />)}
          </div>
        )}
      </div>

      {/* Recommended for You */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[var(--ev-text)]">Recommended for You</h2>
          <Link to="/events" className="inline-flex items-center gap-1 rounded-[10px] border border-[var(--ev-accent-border)] px-4 py-2 text-[13px] font-medium text-[var(--ev-accent)] hover:bg-[var(--ev-accent-bg-subtle)] transition-colors">
            Explore All Events <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recommended.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-[var(--ev-muted)]">You're all caught up! You've registered for all available events. 🎉</p>
        ) : recommended.length <= 3 ? (
          /* Static row — no animation needed */
          <div className="flex gap-4">
            {recommended.map((event, i) => (
              <div key={event.id} className="w-[280px] min-w-[280px] shrink-0">
                <EventCard event={event} index={i} />
              </div>
            ))}
          </div>
        ) : (
          /* Infinite auto-scroll marquee for > 3 events */
          <div className="marquee-container overflow-hidden rounded-[14px]">
            <style>{`
              @keyframes marquee-scroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-track {
                display: flex;
                gap: 1rem;
                width: max-content;
                animation: marquee-scroll ${marqueeSpeed}s linear infinite;
              }
              .marquee-track:hover {
                animation-play-state: paused;
              }
              .marquee-card {
                width: 280px;
                min-width: 280px;
                flex-shrink: 0;
              }
            `}</style>
            <div className="marquee-track">
              {/* Render twice for seamless CSS loop */}
              {[...recommended, ...recommended].map((event, i) => (
                <div key={`rec-${i}`} className="marquee-card">
                  <EventCard event={event} index={i % recommended.length} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
