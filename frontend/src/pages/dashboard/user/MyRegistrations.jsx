import { Calendar, Download, MapPin, Upload, CheckCircle, XCircle, Clock, ImageIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState, EmptyState } from "@/components/SharedUI";
import { formatDate } from "@/lib/formatDate";
import api, { STORAGE_URL } from "@/api/axios";
import { toast } from "sonner";

const statusConfig = {
  free: { label: "Confirmed", cls: "bg-[var(--ev-success-bg)] text-[var(--ev-success)]", icon: CheckCircle },
  verified: { label: "Confirmed", cls: "bg-[var(--ev-success-bg)] text-[var(--ev-success)]", icon: CheckCircle },
  pending: { label: "Pending Payment", cls: "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]", icon: Clock },
  rejected: { label: "Rejected", cls: "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)]", icon: XCircle },
};

function UploadButton({ registration, onUploaded }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large. Max 5MB."); return; }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Only JPG, PNG, WEBP images allowed."); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("paymentScreenshot", file);
      await api.put(`/registrations/${registration._id}/payment-screenshot`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Payment proof uploaded!");
      onUploaded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleUpload} />
      <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
        className="border border-[var(--ev-accent-border)] bg-[var(--ev-accent-bg)] text-[var(--ev-accent)] hover:bg-[var(--ev-accent-bg-subtle)] rounded-lg text-[12px]">
        <Upload className="mr-1 h-3.5 w-3.5" /> {uploading ? "Uploading..." : "Upload Proof"}
      </Button>
    </>
  );
}

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
                    <span className="font-mono text-[var(--ev-accent)]">{r.ticketId}</span>
                  </div>

                  {/* Payment status messages & upload */}
                  {r.paymentStatus === "pending" && (
                    <div className="mt-3 space-y-2">
                      {r.paymentScreenshot ? (
                        <div className="flex items-center gap-3">
                          <img src={`${STORAGE_URL}${r.paymentScreenshot}`} alt="Proof" className="h-12 w-12 rounded-lg object-cover border border-[var(--ev-border)]" />
                          <div>
                            <p className="text-[12px] text-[var(--ev-warning)] font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> Payment proof submitted — awaiting verification</p>
                            <UploadButton registration={r} onUploaded={fetchRegistrations} />
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-[10px] border border-[var(--ev-warning-bg)] bg-[var(--ev-warning-bg)] p-3 flex items-center justify-between">
                          <p className="text-[12px] text-[var(--ev-warning)] font-medium">Upload payment screenshot to complete registration</p>
                          <UploadButton registration={r} onUploaded={fetchRegistrations} />
                        </div>
                      )}
                    </div>
                  )}

                  {r.paymentStatus === "rejected" && (
                    <div className="mt-3 rounded-[10px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-3 flex items-center justify-between">
                      <p className="text-[12px] text-[var(--ev-danger)] font-medium">Payment was rejected. Please upload a valid screenshot.</p>
                      <UploadButton registration={r} onUploaded={fetchRegistrations} />
                    </div>
                  )}

                  {r.paymentStatus === "verified" && r.paymentScreenshot && (
                    <div className="mt-3 flex items-center gap-2 text-[12px] text-[var(--ev-success)]">
                      <CheckCircle className="h-3.5 w-3.5" /> Payment verified
                    </div>
                  )}
                </div>
                <Button size="sm" className="border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-lg shrink-0">
                  <Download className="mr-1 h-3.5 w-3.5" /> Ticket
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
