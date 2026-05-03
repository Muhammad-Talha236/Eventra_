import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { adaptEvents } from "@/lib/eventAdapter";
import api from "@/api/axios";

const categories = ["All", "E-Sports", "Sports", "Concert", "Qawali", "Auto Show"];

export default function Events() {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState(params.get("cat") || "All");
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(adaptEvents(res.data));
      } catch {
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    return events.filter(
      (e) => (category === "All" || e.category === category) && (query === "" || e.title.toLowerCase().includes(query.toLowerCase())),
    );
  }, [category, query, events]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 lg:py-16">
      <div className="max-w-2xl">
        <h1 className="text-[40px] font-bold text-[var(--ev-text)] lg:text-[48px]">All Events</h1>
        <p className="mt-3 text-[var(--ev-muted)]">Browse the complete UniFest 2026 lineup. Use filters to find what excites you.</p>
      </div>

      {/* Filter bar */}
      <div className="sticky top-16 z-40 -mx-6 mt-10 border-b border-[var(--ev-border)] bg-[var(--ev-bg)]/90 backdrop-blur-md px-6 py-4">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ev-muted)]" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events..." className="bg-[var(--ev-surface)] border-[var(--ev-border)] pl-9" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setParams(c === "All" ? {} : { cat: c }); }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${category === c ? "bg-[var(--ev-accent)] text-white" : "bg-[var(--ev-border)] text-[var(--ev-muted)] hover:text-[var(--ev-text)]"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event grid */}
      {loading ? (
        <div className="py-20 text-center text-[var(--ev-muted)]">Loading events...</div>
      ) : error ? (
        <div className="py-20 text-center text-[var(--ev-danger)]">{error}</div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
          </div>
          {filtered.length === 0 && <div className="py-20 text-center text-[var(--ev-muted)]">No events match your filters.</div>}
        </>
      )}
    </div>
  );
}
