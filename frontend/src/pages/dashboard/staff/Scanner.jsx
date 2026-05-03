import { CheckCircle2, ScanLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";
import { toast } from "sonner";

export default function Scanner() {
  const [scanned, setScanned] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [recentScans, setRecentScans] = useState([]);

  const lookupTicket = async (code) => {
    try {
      const res = await api.get("/registrations/all");
      const data = res.data;
      const regs = data.registrations || data;
      const reg = (Array.isArray(regs) ? regs : []).find((r) => r.ticketId === code);
      if (reg) {
        setScanned({ name: reg.user?.name || "Unknown", event: reg.event?.title || "Unknown", valid: true });
        setRecentScans((prev) => [`${reg.user?.name} — ${reg.event?.title}`, ...prev].slice(0, 5));
        // Mark attendance
        try { await api.put(`/registrations/${reg._id}/attendance`); } catch {}
      } else {
        setScanned({ name: "—", event: "—", valid: false });
      }
    } catch {
      toast.error("Failed to verify ticket");
      setScanned(null);
    }
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    setScanning(true); setScanned(null);
    await lookupTicket(ticketCode.trim());
    setScanning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Attendance Scanner</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Enter ticket codes to verify and check-in attendees.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[14px] bg-[var(--ev-elevated)] border border-[var(--ev-border)]">
            <div className="relative aspect-square w-3/4 rounded-[14px] border-2 border-[var(--ev-accent-border)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanLine className="h-16 w-16 text-[var(--ev-accent)] opacity-50" />
              </div>
              {scanning && <div className="absolute left-0 right-0 h-0.5 bg-[var(--ev-accent)] animate-pulse" />}
            </div>
          </div>
          <form onSubmit={handleManualLookup} className="mt-4 flex gap-2">
            <Input value={ticketCode} onChange={(e) => setTicketCode(e.target.value)} placeholder="Enter ticket code (e.g. TKT-ABC123)" className="h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)] flex-1" />
            <Button type="submit" disabled={scanning} className="h-11 bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px] px-6">
              {scanning ? "Checking..." : "Verify"}
            </Button>
          </form>
        </div>

        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="mb-4 text-[16px] font-bold text-[var(--ev-text)]">Scan Result</h3>
          {!scanned ? (
            <p className="text-[13px] text-[var(--ev-muted)]">Enter a ticket code to verify...</p>
          ) : scanned.valid ? (
            <div>
              <div className="rounded-[14px] border border-[var(--ev-success-border)] bg-[var(--ev-success-bg-subtle)] p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-10 w-10 text-[var(--ev-success)]" />
                  <div><p className="text-[16px] font-bold text-[var(--ev-text)]">Valid ticket ✓</p><p className="text-[13px] text-[var(--ev-muted)]">Checked in successfully</p></div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                <p className="text-[var(--ev-muted)]">Name</p><p className="font-semibold text-[var(--ev-text)]">{scanned.name}</p>
                <p className="text-[var(--ev-muted)]">Event</p><p className="font-semibold text-[var(--ev-text)]">{scanned.event}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-[14px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-6">
              <p className="text-[16px] font-bold text-[var(--ev-danger)]">Invalid ticket ✗</p>
              <p className="text-[13px] text-[var(--ev-muted)]">No registration found for this code.</p>
            </div>
          )}
          <div className="mt-6">
            <p className="mb-3 text-[13px] font-semibold text-[var(--ev-text)]">Recent Scans</p>
            {recentScans.length === 0 ? (
              <p className="text-[13px] text-[var(--ev-muted)]">No scans yet.</p>
            ) : (
              <div className="space-y-2 text-[13px]">
                {recentScans.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-elevated)] px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--ev-success)]" /><span className="text-[var(--ev-text)]">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
