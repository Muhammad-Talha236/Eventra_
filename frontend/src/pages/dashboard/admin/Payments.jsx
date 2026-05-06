import { Check, X, Clock, ShieldCheck, Search, Eye, ImageOff } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/StatCard";
import { ModalOverlay, ConfirmModal, LoadingState, EmptyState, Pagination } from "@/components/SharedUI";
import { formatDateTime } from "@/lib/formatDate";
import { getImageUrl } from "@/lib/imageUrl";
import api from "@/api/axios";
import { toast } from "sonner";

const PER_PAGE = 15;
/* ── Payment Proof Modal ── */
function PaymentProofModal({ payment, onClose, onVerify, onReject }) {
  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      if (action === "verify") await onVerify(payment);
      else await onReject(payment);
      onClose();
    } catch { /* parent handles toast */ }
    finally { setActionLoading(null); }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="max-h-[85vh] overflow-y-auto rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-[var(--ev-text)]">Payment Proof</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-[var(--ev-muted)] hover:text-[var(--ev-text)]"><X className="h-5 w-5" /></button>
        </div>

        {/* Payment Screenshot Display with Fallback */}
        {payment.screenshot ? (
          <div style={{
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img
              src={getImageUrl(payment.screenshot)}
              alt="Payment proof screenshot"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'contain',
                display: 'block',
                backgroundColor: '#000'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
            {/* Fallback if image fails to load */}
            <div style={{
              display: 'none',
              width: '100%',
              height: '200px',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '14px'
            }}>
              Image could not be loaded
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            marginBottom: '16px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px'
          }}>
            No payment proof uploaded yet
          </div>
        )}

        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-[13px]">
            <span className="text-[var(--ev-muted)]">User</span>
            <span className="font-semibold text-[var(--ev-text)]">{payment.user}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[var(--ev-muted)]">Event</span>
            <span className="font-semibold text-[var(--ev-text)]">{payment.event}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[var(--ev-muted)]">Amount</span>
            <span className="font-semibold text-[var(--ev-text)]">PKR {(payment.amount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[var(--ev-muted)]">Submitted</span>
            <span className="font-semibold text-[var(--ev-text)]">{payment.time}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[var(--ev-muted)]">Status</span>
            <span className={`rounded-full px-3 py-0.5 text-[12px] font-medium ${statusBadge(payment.status)}`}>{payment.status}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => handleAction("reject")} disabled={!!actionLoading}
            className="flex-1 bg-[var(--ev-danger)] text-white hover:bg-[var(--ev-danger-hover)] rounded-[10px]">
            {actionLoading === "reject" ? "Rejecting…" : "Reject Payment"}
          </Button>
          <Button onClick={() => handleAction("verify")} disabled={!!actionLoading}
            className="flex-1 bg-[var(--ev-success)] text-black hover:opacity-90 rounded-[10px]">
            {actionLoading === "verify" ? "Verifying…" : "Verify Payment"}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function statusBadge(status) {
  if (status === "verified") return "bg-[var(--ev-success-bg)] text-[var(--ev-success)] border border-[var(--ev-success-border)]";
  if (status === "rejected") return "bg-[var(--ev-danger-bg)] text-[var(--ev-danger)] border border-[var(--ev-danger-border)]";
  return "bg-[var(--ev-warning-bg)] text-[var(--ev-warning)] border border-[var(--ev-warning-bg)]";
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [proofTarget, setProofTarget] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(null);
  const [page, setPage] = useState(1);

  const fetchPayments = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get("/registrations/all");
      const data = res.data;
      const regs = data.registrations || data;
      const apiCounts = data.counts || null;

      setPayments((Array.isArray(regs) ? regs : []).filter((r) => r.paymentStatus !== "free").map((r) => ({
        id: r._id, user: r.user?.name || "Unknown", userEmail: r.user?.email || "",
        event: r.event?.title || "Unknown",
        amount: r.totalAmount || r.event?.fee || 0, status: r.paymentStatus,
        screenshot: r.paymentScreenshot || null,
        time: formatDateTime(r.createdAt),
      })));

      if (apiCounts) setCounts(apiCounts);
    } catch {
      setError("Failed to load payments");
      toast.error("Failed to load payments");
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleApprove = async (p) => {
    try {
      await api.put(`/registrations/${p.id}/payment`, { paymentStatus: "verified" });
      toast.success(`Payment verified for ${p.user}`);
      fetchPayments();
    } catch { toast.error("Failed to verify"); }
  };

  const handleReject = async (p) => {
    try {
      await api.put(`/registrations/${p.id}/payment`, { paymentStatus: "rejected" });
      toast.success(`Payment rejected for ${p.user}`);
      fetchPayments();
    } catch { toast.error("Failed to reject"); }
  };

  // Filtering
  const filtered = payments.filter((p) => {
    const matchesSearch = !search ||
      p.user.toLowerCase().includes(search.toLowerCase()) ||
      p.event.toLowerCase().includes(search.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <LoadingState message="Loading payments..." />;
  if (error) return (
    <div className="flex flex-col items-center py-20">
      <p className="text-[var(--ev-danger)]">{error}</p>
      <Button onClick={fetchPayments} className="mt-4 bg-[var(--ev-accent)] text-white rounded-[10px]">Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Payment Verification</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Approve or reject pending payment submissions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={counts.pending} icon={Clock} />
        <StatCard label="Verified" value={counts.verified} icon={ShieldCheck} />
        <StatCard label="Rejected" value={counts.rejected} icon={X} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ev-muted)]" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by user or event..." className="bg-[var(--ev-surface)] border-[var(--ev-border)] pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-[10px] border border-[var(--ev-border)] bg-[var(--ev-surface)] px-3 text-[14px] text-[var(--ev-text)]">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No payments found" description={search || statusFilter !== "all" ? "Try adjusting your filters." : "No paid registrations yet."} />
      ) : (
        <>
          <p className="text-[13px] text-[var(--ev-muted)]">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
          <div className="rounded-[14px] border border-[var(--ev-border)] overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead><tr className="bg-[var(--ev-elevated)] text-left">
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">User</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Event</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Amount</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Time</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Status</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)]">Proof</th>
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--ev-muted)] text-right">Actions</th>
              </tr></thead>
              <tbody>{paginated.map((p) => (
                <tr key={p.id} className="border-t border-[var(--ev-border)] bg-[var(--ev-surface)] hover:bg-[var(--ev-hover)] transition-colors">
                  <td className="px-5 py-4 text-[14px] font-semibold text-[var(--ev-text)]">{p.user}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{p.event}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-text)]">PKR {(p.amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--ev-muted)]">{p.time}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td className="px-5 py-4">
                    {p.screenshot ? (
                      <Button size="sm" onClick={() => setProofTarget(p)}
                        className="h-7 gap-1 bg-[var(--ev-accent-bg)] text-[var(--ev-accent)] border border-[var(--ev-accent-border)] hover:bg-[var(--ev-accent-bg-subtle)] rounded-lg text-[12px]">
                        <Eye className="h-3 w-3" /> View Proof
                      </Button>
                    ) : (
                      <span className="rounded-full px-3 py-1 text-[11px] font-medium bg-[var(--ev-border)] text-[var(--ev-muted)]">Awaiting proof</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(p)}
                            className="h-8 bg-[var(--ev-success)] text-black hover:opacity-90 rounded-lg"><Check className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" onClick={() => setRejectConfirm(p)}
                            className="h-8 bg-[var(--ev-danger)] text-white hover:bg-[var(--ev-danger-hover)] rounded-lg"><X className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                      {(p.status === "verified" || p.status === "rejected") && p.screenshot && (
                        <Button size="sm" onClick={() => setProofTarget(p)}
                          className="h-8 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-lg text-[12px]">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Proof Modal */}
      {proofTarget && (
        <PaymentProofModal payment={proofTarget} onClose={() => setProofTarget(null)}
          onVerify={async (p) => { await handleApprove(p); }} onReject={async (p) => { await handleReject(p); }} />
      )}

      {/* Reject Confirmation */}
      {rejectConfirm && (
        <ConfirmModal title="Reject Payment" message={`Are you sure you want to reject the payment from ${rejectConfirm.user} for ${rejectConfirm.event}?`}
          confirmLabel="Reject" variant="danger" icon={X}
          onConfirm={async () => { await handleReject(rejectConfirm); setRejectConfirm(null); }}
          onClose={() => setRejectConfirm(null)} />
      )}
    </div>
  );
}
