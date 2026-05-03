import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";
import { toast } from "sonner";

export default function ManualRegistration() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try { const res = await api.get("/events"); setEvents(res.data); }
      catch {} finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="py-20 text-center text-[var(--ev-muted)]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Manual Registration</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Register walk-in attendees on the spot.</p>
      </div>
      <div className="max-w-2xl rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Attendee registered & ticket generated!"); }} className="grid gap-4 sm:grid-cols-2">
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Full name</Label><Input className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" required /></div>
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Phone</Label><Input className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" required /></div>
          <div className="sm:col-span-2"><Label className="text-[13px] text-[var(--ev-muted)]">Email</Label><Input type="email" className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" required /></div>
          <div className="sm:col-span-2">
            <Label className="text-[13px] text-[var(--ev-muted)]">Event</Label>
            <select className="mt-1.5 h-11 w-full rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 text-[14px] text-[var(--ev-text)]">
              {events.length === 0 ? <option>No events available</option> : events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Payment method</Label><Input className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" defaultValue="Cash" /></div>
          <div><Label className="text-[13px] text-[var(--ev-muted)]">Amount paid</Label><Input className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" defaultValue="0" /></div>
          <div className="sm:col-span-2"><Button type="submit" className="h-11 w-full bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">Generate Ticket</Button></div>
        </form>
      </div>
    </div>
  );
}
