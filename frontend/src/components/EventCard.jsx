import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function EventCard({ event, index = 0 }) {
  return (
    <div className="group rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--ev-accent-border)] hover:shadow-[0_0_30px_rgba(108,99,255,0.08)]">
      <Link to={`/events/${event.id}`} className="block">
        {/* Image */}
        <div className="relative h-[180px] overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-[var(--ev-accent)] px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
              {event.category}
            </span>
          </div>
          {event.status === "live" && (
            <div className="absolute right-3 top-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ev-danger)] px-2.5 py-1 text-[11px] font-semibold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-[15px] font-bold leading-snug text-[var(--ev-text)] group-hover:text-[var(--ev-accent)] transition-colors">
            {event.title}
          </h3>
          <div className="mt-3 space-y-1.5 text-[13px] text-[var(--ev-muted)]">
            <p className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {event.date} · {event.time}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue}
            </p>
            <p className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              {(event.registered || 0).toLocaleString()} / {(event.capacity || 0).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-[var(--ev-accent)]">PKR {(event.price || 0).toLocaleString()}</span>
            <span className="rounded-full bg-[var(--ev-border)] px-3 py-1 text-[12px] font-medium text-[var(--ev-muted)] group-hover:bg-[var(--ev-accent)] group-hover:text-white transition-all">
              View →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
