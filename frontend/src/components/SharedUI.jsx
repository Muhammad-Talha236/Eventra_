import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Shared Modal Overlay ── */
export function ModalOverlay({ children, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--ev-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

/* ── Shared Confirmation Modal ── */
export function ConfirmModal({
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  icon: Icon = Trash2,
  variant = 'danger', // 'danger' | 'warning' | 'accent'
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const variantStyles = {
    danger: {
      iconBg: 'bg-[var(--ev-danger-bg)] border-[var(--ev-danger-border)]',
      iconColor: 'text-[var(--ev-danger)]',
      btnBg: 'bg-[var(--ev-danger)] hover:bg-[var(--ev-danger-hover)]',
    },
    warning: {
      iconBg: 'bg-[var(--ev-warning-bg)] border-[var(--ev-warning-bg)]',
      iconColor: 'text-[var(--ev-warning)]',
      btnBg: 'bg-[var(--ev-warning)] hover:opacity-90',
    },
    accent: {
      iconBg: 'bg-[var(--ev-accent-bg)] border-[var(--ev-accent-border)]',
      iconColor: 'text-[var(--ev-accent)]',
      btnBg: 'bg-[var(--ev-accent)] hover:bg-[var(--ev-accent-hover)]',
    },
  };
  const s = variantStyles[variant] || variantStyles.danger;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Action failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6 text-center">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${s.iconBg} border`}>
          <Icon className={`h-6 w-6 ${s.iconColor}`} />
        </div>
        <h3 className="text-[18px] font-bold text-[var(--ev-text)]">{title}</h3>
        <p className="mt-2 text-[14px] text-[var(--ev-muted)]">{message}</p>
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-[var(--ev-danger-border)] bg-[var(--ev-danger-bg-subtle)] p-3 text-left">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--ev-danger)]" />
            <p className="text-[13px] text-[var(--ev-danger)]">{error}</p>
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <Button onClick={onClose} disabled={loading}
            className="flex-1 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={loading}
            className={`flex-1 text-white rounded-[10px] ${s.btnBg}`}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : confirmLabel}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--ev-accent-bg)] border border-[var(--ev-accent-border)]">
          <Icon className="h-7 w-7 text-[var(--ev-accent)]" />
        </div>
      )}
      <h3 className="text-[16px] font-bold text-[var(--ev-text)]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[13px] text-[var(--ev-muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Loading State ── */
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--ev-accent)]" />
      <p className="mt-3 text-[14px] text-[var(--ev-muted)]">{message}</p>
    </div>
  );
}

/* ── Error State ── */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--ev-danger-bg)] border border-[var(--ev-danger-border)]">
        <AlertTriangle className="h-7 w-7 text-[var(--ev-danger)]" />
      </div>
      <h3 className="text-[16px] font-bold text-[var(--ev-text)]">Error</h3>
      <p className="mt-1 max-w-sm text-[13px] text-[var(--ev-muted)]">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-4 bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">
          Try Again
        </Button>
      )}
    </div>
  );
}

/* ── Pagination ── */
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[var(--ev-border)] pt-4 mt-4">
      <p className="text-[13px] text-[var(--ev-muted)]">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}
          className="h-8 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-lg text-[13px] disabled:opacity-40">
          Previous
        </Button>
        <Button size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}
          className="h-8 border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-lg text-[13px] disabled:opacity-40">
          Next
        </Button>
      </div>
    </div>
  );
}
