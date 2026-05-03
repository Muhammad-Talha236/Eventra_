import { ArrowLeft, Calendar, Clock, MapPin, Share2, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { adaptEvent } from "@/lib/eventAdapter";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import { toast } from "sonner";

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(adaptEvent(res.data));
      } catch {
        setError("Event not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleReserveTicket = async () => {
    if (!user) { toast.error("Please login to reserve a ticket."); return; }
    setRegistering(true);
    try {
      await api.post("/registrations", { eventId: event._id || event.id });
      toast.success("Reserved! Check your registrations.");
      // Refetch event to update registered count
      const res = await api.get(`/events/${id}`);
      setEvent(adaptEvent(res.data));
    } catch (err) { toast.error(err.response?.data?.message || "Failed to register."); }
    finally { setRegistering(false); }
  };

  if (loading) return <div className="mx-auto max-w-[1200px] px-6 py-20 text-center text-[var(--ev-muted)]">Loading event...</div>;
  if (error || !event) return <div className="mx-auto max-w-[1200px] px-6 py-20 text-center text-[var(--ev-text)]">{error || "Event not found."} <Link to="/events" className="text-[var(--ev-accent)] font-semibold">Browse all</Link></div>;

  const occupancy = event.capacity > 0 ? (event.registered / event.capacity) * 100 : 0;

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={event.image} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ev-bg)] via-[var(--ev-bg)]/70 to-[var(--ev-bg)]/30" />
        <div className="relative mx-auto flex h-full max-w-[1200px] items-end px-6 pb-10">
          <div className="max-w-3xl">
            <Link to="/events" className="mb-4 inline-flex items-center gap-2 text-[13px] text-[var(--ev-muted)] hover:text-[var(--ev-text)] transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to events
            </Link>
            <span className="inline-block rounded-full bg-[var(--ev-accent)] px-3 py-1 text-[11px] font-semibold text-white">{event.category}</span>
            <h1 className="mt-4 text-[36px] font-bold leading-tight text-[var(--ev-text)] lg:text-[52px]">{event.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
            <h2 className="text-[20px] font-bold text-[var(--ev-text)]">About this event</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ev-muted)]">
              {event.description} Join thousands of students from across the region for an unforgettable experience.
              Doors open 60 minutes before showtime.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Calendar, label: "Date", value: event.date },
              { icon: Clock, label: "Time", value: event.time },
              { icon: MapPin, label: "Venue", value: event.venue },
              { icon: Users, label: "Capacity", value: `${(event.registered||0).toLocaleString()} / ${(event.capacity||0).toLocaleString()}` },
            ].map((item) => (
              <div key={item.label} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5 flex items-center gap-4 hover:border-[var(--ev-accent-border)] transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ev-accent)]">
                  <item.icon className="h-5 w-5 text-[var(--ev-text)]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase text-[var(--ev-muted)]">{item.label}</p>
                  <p className="text-[14px] font-semibold text-[var(--ev-text)]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
            <h3 className="text-[18px] font-bold text-[var(--ev-text)]">Schedule</h3>
            <div className="mt-4 space-y-3">
              {[
                { time: "60 min before", description: "Doors open & check-in via QR" },
                { time: "On time", description: "Opening announcement" },
                { time: "+30 min", description: "Main programme begins" },
                { time: "+90 min", description: "Intermission" },
              ].map((s) => (
                <div key={s.time} className="flex items-start gap-4 border-l-2 border-[var(--ev-accent-border)] pl-4">
                  <p className="text-[11px] uppercase text-[var(--ev-muted)]">{s.time}</p>
                  <p className="text-[14px] font-medium text-[var(--ev-text)]">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[14px] border border-[var(--ev-accent-border)] bg-[var(--ev-surface)] p-6">
            <p className="text-[13px] text-[var(--ev-muted)]">Ticket price</p>
            <p className="mt-1 text-[36px] font-bold text-[var(--ev-accent)]">PKR {(event.price || 0).toLocaleString()}</p>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-[12px] text-[var(--ev-muted)]">
                <span>{(event.registered||0).toLocaleString()} registered</span>
                <span>{Math.round(occupancy)}% full</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--ev-border)]">
                <div className="h-full bg-[var(--ev-accent)] transition-all duration-700" style={{ width: `${occupancy}%` }} />
              </div>
            </div>

            <Button onClick={handleReserveTicket} disabled={registering} className="mt-6 h-11 w-full bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
              <Ticket className="mr-2 h-4 w-4" />
              {registering ? "Reserving..." : "Reserve Ticket"}
            </Button>
            <Button onClick={() => toast("Link copied!")} className="mt-2 w-full h-11 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>

          <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
            <p className="mb-3 text-[14px] font-semibold text-[var(--ev-text)]">Organizer</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--ev-accent)]" />
              <div>
                <p className="text-[13px] font-semibold text-[var(--ev-text)]">UniFest Committee</p>
                <p className="text-[12px] text-[var(--ev-muted)]">events@unifest.edu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
