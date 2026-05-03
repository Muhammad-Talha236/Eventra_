import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin } from "lucide-react";

export function TicketCard({ event, ticketCode, seat }) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] overflow-hidden">
        {/* Header */}
        <div className="relative h-28 bg-[var(--ev-accent)]">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative p-5 text-[var(--ev-text)]">
            <p className="text-[11px] uppercase tracking-widest opacity-80">{event?.category}</p>
            <h3 className="mt-1 text-[18px] font-bold leading-tight">{event?.title}</h3>
          </div>
        </div>

        {/* Tear */}
        <div className="relative">
          <div className="absolute left-[-12px] top-[-12px] h-6 w-6 rounded-full bg-[var(--ev-bg)]" />
          <div className="absolute right-[-12px] top-[-12px] h-6 w-6 rounded-full bg-[var(--ev-bg)]" />
          <div className="border-t border-dashed border-[var(--ev-border)]" />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 p-5 text-[13px]">
          <div>
            <p className="text-[11px] uppercase text-[var(--ev-muted)]">Date</p>
            <p className="mt-1 flex items-center gap-1.5 font-semibold text-[var(--ev-text)]"><Calendar className="h-3.5 w-3.5" />{event?.date}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-[var(--ev-muted)]">Time</p>
            <p className="mt-1 font-semibold text-[var(--ev-text)]">{event?.time}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-[var(--ev-muted)]">Venue</p>
            <p className="mt-1 flex items-center gap-1.5 font-semibold text-[var(--ev-text)]"><MapPin className="h-3.5 w-3.5" />{event?.venue}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-[var(--ev-muted)]">Seat</p>
            <p className="mt-1 font-semibold text-[var(--ev-text)]">{seat}</p>
          </div>
        </div>

        <div className="border-t border-dashed border-[var(--ev-border)]" />

        {/* QR */}
        <div className="flex items-center gap-4 bg-[var(--ev-elevated)] p-5">
          <div className="rounded-[10px] bg-white p-2">
            <QRCodeSVG value={ticketCode} size={88} />
          </div>
          <div>
            <p className="text-[11px] uppercase text-[var(--ev-muted)]">Ticket Code</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-[var(--ev-text)]">{ticketCode}</p>
            <p className="mt-2 text-[12px] font-semibold text-[var(--ev-success)]">✓ Confirmed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
