import { useEffect, useState, useRef } from "react";
import { Users, CheckCircle, Clock, XCircle, Upload } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusColors = {
  verified: "bg-[var(--ev-success-bg)] text-[var(--ev-success)]",
  pending: "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)]",
  rejected: "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)]",
  free: "bg-[var(--ev-success-bg)] text-[var(--ev-success)]"
};

function UploadProofButton({ registrationId, onUploaded }) {
  const fileRef = useRef(null);
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("paymentScreenshot", file);
      // Using the exact existing registration screenshot endpoint
      await api.put(`/registrations/${registrationId}/payment-screenshot`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Payment proof uploaded!");
      onUploaded();
    } catch (err) {
      toast.error("Upload failed");
    }
  };
  return (
    <>
      <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
      <Button size="sm" onClick={() => fileRef.current?.click()} className="mt-3 w-full bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] text-[12px]"><Upload className="mr-2 h-3.5 w-3.5" /> Upload Payment Proof</Button>
    </>
  );
}

export default function MyTeams() {
  const [teams, setTeams] = useState([]);

  const fetchTeams = () => api.get("/teams/my").then(res => setTeams(res.data));
  useEffect(() => { fetchTeams(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">My Teams</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Manage your team registrations and payments.</p>
      </div>
      {teams.length === 0 ? (
        <div className="py-10 text-[var(--ev-muted)]">No teams formed yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map(t => {
            const regStatus = t.registration?.paymentStatus || "pending";
            return (
              <div key={t._id} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--ev-text)]">{t.name}</h3>
                    <p className="text-[13px] text-[var(--ev-muted)]">{t.event?.title}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-medium border ${statusColors[regStatus] || statusColors.pending}`}>{regStatus.toUpperCase()}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[13px] text-[var(--ev-muted)]">
                  <Users className="h-4 w-4" /> {t.members.length} Members | Total: PKR {t.totalFee.toLocaleString()}
                </div>
                {t.registration && regStatus === "pending" && !t.registration.paymentScreenshot && (
                   <UploadProofButton registrationId={t.registration._id} onUploaded={fetchTeams} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}