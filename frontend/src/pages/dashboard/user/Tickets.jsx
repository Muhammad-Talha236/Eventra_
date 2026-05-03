import { useEffect, useState } from "react";
import { TicketCard } from "@/components/TicketCard";
import { adaptEvents } from "@/lib/eventAdapter";
import api from "@/api/axios";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/registrations/my");
        setTickets(res.data.filter((r) => r.event).map((r) => ({
          id: r._id, ticketCode: r.ticketId, seat: "GA",
          event: adaptEvents([r.event])[0],
        })));
      } catch {}
      finally { setLoading(false); }
    };
    fetchTickets();
  }, []);

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Tickets & QR</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Show your QR at the gate for instant entry.</p>
      </div>
      {tickets.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-[var(--ev-muted)]">No tickets yet. Register for events to get your QR tickets!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t) => <TicketCard key={t.id} event={t.event} ticketCode={t.ticketCode} seat={t.seat} />)}
        </div>
      )}
    </div>
  );
}
