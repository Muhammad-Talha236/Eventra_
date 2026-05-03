import { ArrowRight, Calendar, Car, Gamepad2, Music, Sparkles, Trophy, Users, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { adaptEvents } from "@/lib/eventAdapter";
import api from "@/api/axios";

const categories = [
  { name: "E-Sports", icon: Gamepad2 },
  { name: "Sports", icon: Trophy },
  { name: "Concerts", icon: Music },
  { name: "Qawali", icon: Sparkles },
  { name: "Auto Show", icon: Car },
];

const features = [
  { icon: Calendar, title: "Seamless Registration", description: "Reserve your spot in seconds with QR-coded tickets sent instantly to your phone." },
  { icon: Users, title: "Role-Based Access", description: "Admins, staff, volunteers, and attendees â€” every role has the perfect dashboard." },
  { icon: Activity, title: "Real-Time Updates", description: "Schedule changes, announcements and live event status, always in sync." },
];

export default function Index() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(adaptEvents(res.data));
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Derive category counts from real data
  const categoryCounts = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover',
              zIndex: 0
            }}
          >
            <source
              src="https://res.cloudinary.com/dwi8iifh2/video/upload/v1777821383/daira_video_n4ihsz.mp4"
              type="video/mp4"
            />
          </video>

          {/* Dark overlay for text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.55)',
            zIndex: 1
          }} />

          {/* Existing hero content — keep exactly as is, just wrap in this div */}
          <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
            <div className="mx-auto flex h-full max-w-[1200px] items-center px-6 py-10">
              <div className="w-full">
                <div className="mx-auto max-w-3xl text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ev-accent-border)] bg-[var(--ev-accent-bg-subtle)] px-4 py-1.5 text-[12px] font-semibold text-[var(--ev-muted)]">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--ev-accent)]" />
                    3 Days A· {events.length}+ Events A· 1 Mega Festival
                  </div>

                  <h1 className="mt-8 text-[48px] font-bold leading-[1.1] tracking-tight text-[var(--ev-text)] sm:text-[56px] lg:text-[72px]">
                    The University Event of{" "}
                    <span className="text-[var(--ev-accent)]">a Generation</span>
                  </h1>

                  <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-[var(--ev-muted)]">
                    UniFest 2026 brings together e-sports tournaments, electrifying concerts, sports, qawali nights and a mega auto show - all on one platform.
                  </p>

                  <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button asChild size="lg" className="h-12 rounded-[10px] bg-[var(--ev-accent)] px-8 text-white hover:bg-[var(--ev-accent-hover)]">
                      <Link to="/events">
                        Explore Events <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {!user && (
                      <Button asChild variant="outline" size="lg" className="h-12 rounded-[10px] border-[var(--ev-border)] px-8 text-[var(--ev-text)] hover:bg-[var(--ev-surface)]">
                        <Link to="/signup">Create Account</Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { value: `${events.reduce((sum, e) => sum + (e.registered || 0), 0).toLocaleString()}+`, label: "Registrations" },
                    { value: `${events.length}+`, label: "Events" },
                    { value: "15", label: "Universities" },
                    { value: "3 Days", label: "Non-stop" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5 text-center">
                      <p className="text-[28px] font-bold text-[var(--ev-accent)]">{stat.value}</p>
                      <p className="mt-1 text-[12px] uppercase tracking-widest text-[var(--ev-muted)]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ CATEGORIES â”€â”€ */}
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-[32px] font-bold text-[var(--ev-text)]">Explore by Category</h2>
          <p className="mt-3 text-[var(--ev-muted)]">Five vibrant tracks. Endless experiences.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/events?cat=${cat.name}`}
              className="group rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6 text-center transition-all hover:border-[var(--ev-accent-border)] hover:-translate-y-1"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ev-accent)] transition-transform group-hover:scale-110">
                <cat.icon className="h-7 w-7 text-[var(--ev-text)]" />
              </div>
              <p className="mt-4 text-[14px] font-semibold text-[var(--ev-text)]">{cat.name}</p>
              <p className="mt-1 text-[12px] text-[var(--ev-muted)]">{categoryCounts[cat.name] || 0} events</p>
            </Link>
          ))}
        </div>
      </section>

      {/* â”€â”€ FEATURED EVENTS â”€â”€ */}
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-[32px] font-bold text-[var(--ev-text)]">Featured Events</h2>
            <p className="mt-2 text-[var(--ev-muted)]">Don't miss what everyone's talking about.</p>
          </div>
          <Button variant="ghost" asChild className="hidden text-[var(--ev-muted)] hover:text-[var(--ev-text)] sm:inline-flex">
            <Link to="/events">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        {loading ? (
          <div className="py-20 text-center text-[var(--ev-muted)]">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center text-[var(--ev-muted)]">No events available yet.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.slice(0, 4).map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* â”€â”€ FEATURES â”€â”€ */}
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6 transition-all hover:border-[var(--ev-accent-border)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ev-accent)]">
                <f.icon className="h-6 w-6 text-[var(--ev-text)]" />
              </div>
              <h3 className="mt-5 text-[18px] font-bold text-[var(--ev-text)]">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--ev-muted)]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ CTA BANNER (hidden for logged-in users) â”€â”€ */}
      {!user && (
        <section className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="relative overflow-hidden rounded-[20px] border border-[var(--ev-accent-border)] bg-[var(--ev-surface)] p-10 text-center lg:p-16">
            <div className="absolute left-0 top-0 h-full w-full" style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, var(--ev-accent-glow), transparent 50%), radial-gradient(circle at 70% 50%, var(--ev-accent-glow), transparent 50%)",
            }} />
            <div className="relative">
              <h2 className="text-[32px] font-bold text-[var(--ev-text)] sm:text-[40px]">
                Ready to be part of <span className="text-[var(--ev-accent)]">UniFest 2026</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[var(--ev-muted)]">
                Sign up now to secure early-bird pricing on all events.
              </p>
              <Button asChild size="lg" className="mt-8 h-12 rounded-[10px] bg-[var(--ev-accent)] px-8 text-white hover:bg-[var(--ev-accent-hover)]">
                <Link to="/signup">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
