import { Calendar, Download, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState, EmptyState } from "@/components/SharedUI";
import { formatDate } from "@/lib/formatDate";
import { getImageUrl } from "@/lib/imageUrl";
import api from "@/api/axios";
import { toast } from "sonner";

const statusConfig = {
  free: { label: "Confirmed", cls: "bg-[var(--ev-success-bg)] text-[var(--ev-success)]", icon: CheckCircle, showTicket: true, message: null },
  verified: { label: "Payment Verified", cls: "bg-[var(--ev-success-bg)] text-[var(--ev-success)]", icon: CheckCircle, showTicket: true, message: "Your ticket is ready!" },
  pending: { label: "Pending Verification", cls: "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]", icon: Clock, showTicket: false, message: "Your payment is being reviewed by admin." },
  rejected: { label: "Payment Rejected", cls: "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)]", icon: XCircle, showTicket: false, message: "Your payment was rejected. Please contact admin." },
};

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get("/registrations/my");
      setRegistrations(res.data.filter(r => r.event));
    } catch { toast.error("Failed to load registrations"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRegistrations(); }, []);

  if (loading) return <LoadingState message="Loading registrations..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">My Registrations</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">All your event registrations in one place.</p>
      </div>
      {registrations.length === 0 ? (
        <EmptyState icon={Calendar} title="No registrations yet" description="Browse events to get started!" />
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => {
            const event = r.event;
            const sc = statusConfig[r.paymentStatus] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={r._id} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-4 flex flex-col gap-4 md:flex-row md:items-start hover:border-[var(--ev-accent-border)] transition-all">
                <img src={event.banner || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800"} alt={event.title}
                  className="h-24 w-full rounded-[10px] object-cover md:w-32 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--ev-accent-bg)] px-3 py-1 text-[11px] font-medium text-[var(--ev-accent)] border border-[var(--ev-accent-border)]">{event.category}</span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-medium flex items-center gap-1 ${sc.cls}`}>
                      <StatusIcon className="h-3 w-3" /> {sc.label}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[16px] font-bold text-[var(--ev-text)]">{event.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-4 text-[13px] text-[var(--ev-muted)]">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.date)} · {event.startTime || ""}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.venue}</span>
                    {/* Only show ticket ID if payment is verified or free */}
                    {(r.paymentStatus === "verified" || r.paymentStatus === "free") && (
                      <span className="font-mono text-[var(--ev-accent)]">{r.ticketId}</span>
                    )}
                  </div>

                  {/* Status message section */}
                  {sc.message && (
                    <div className="mt-3 rounded-[10px] p-3" style={{
                      background: r.paymentStatus === "verified" ? "rgba(34, 197, 94, 0.1)" : 
                                  r.paymentStatus === "pending" ? "rgba(255, 165, 0, 0.1)" :
                                  r.paymentStatus === "rejected" ? "rgba(239, 68, 68, 0.1)" : "transparent",
                      border: r.paymentStatus === "verified" ? "1px solid rgba(34, 197, 94, 0.2)" :
                              r.paymentStatus === "pending" ? "1px solid rgba(255, 165, 0, 0.2)" :
                              r.paymentStatus === "rejected" ? "1px solid rgba(239, 68, 68, 0.2)" : "none"
                    }}>
                      <p className="text-[12px] font-medium" style={{
                        color: r.paymentStatus === "verified" ? "rgb(34, 197, 94)" :
                               r.paymentStatus === "pending" ? "rgb(255, 165, 0)" :
                               r.paymentStatus === "rejected" ? "rgb(239, 68, 68)" : "inherit"
                      }}>
                        {sc.message}
                      </p>
                    </div>
                  )}

                  {/* Payment Status and Proof Display */}
                  {r.paymentStatus === "rejected" && (
                    <div className="mt-3 rounded-[10px] bg-[var(--ev-danger-bg-subtle)] border border-[var(--ev-danger-border)] p-3">
                      <p className="text-[12px] text-[var(--ev-danger)] font-medium">Payment was rejected. Please contact admin.</p>
                    </div>
                  )}

                  {r.paymentStatus === "verified" && r.paymentScreenshot && (
                    <div className="mt-3">
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                          Payment Proof:
                        </p>
                        <img
                          src={getImageUrl(r.paymentScreenshot)}
                          alt="Your payment proof"
                          style={{
                            width: '120px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.15)'
                          }}
                          onClick={() => window.open(getImageUrl(r.paymentScreenshot), '_blank')}
                          title="Click to view full size"
                          onError={(e) => e.target.style.opacity = '0.5'}
                        />
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                          Click to view full size
                        </p>
                      </div>
                    </div>
                  )}
                
                </div>
                {/* Ticket button — only show if payment verified or free */}
                {sc.showTicket ? (
                  <Button size="sm" className="border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-lg shrink-0">
                    <Download className="mr-1 h-3.5 w-3.5" /> Ticket
                  </Button>
                ) : (
                  <div className="shrink-0 flex items-center">
                    <span className="text-[12px] text-[var(--ev-muted)]">
                      {r.paymentStatus === "pending" ? "⏳ Verifying..." : "Not Available"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
