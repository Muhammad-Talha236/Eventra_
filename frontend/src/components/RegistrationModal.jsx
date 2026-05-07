import { CheckCircle, X, ChevronRight, ChevronLeft, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/SharedUI";
import { formatDate } from "@/lib/formatDate";
import api from "@/api/axios";
import { toast } from "sonner";

export default function RegistrationModal({ event, user, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const fileInputRef = useRef(null);

  // Check if this is a paid event (use event.price instead of event.fee)
  const isPaidEvent = event.price && event.price > 0 && !event.isFree;
  const isStep2Required = isPaidEvent;

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP images allowed.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleContinueToPayment = () => {
    if (isStep2Required) {
      setStep(2);
    } else {
      // Free event — go directly to submission
      handleSubmitRegistration();
    }
  };

  const handleSubmitRegistration = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Register for event
      const regResponse = await api.post("/registrations", { eventId: event._id || event.id });
      const registration = regResponse.data;
      // NOTE: Ticket ID is generated at registration but NOT shown to user yet
      // User must wait for admin verification before seeing ticket

      // Step 2: If paid event and file selected, upload screenshot immediately
      if (selectedFile && isPaidEvent) {
        const formData = new FormData();
        formData.append("paymentScreenshot", selectedFile);

        await api.put(`/registrations/${registration._id}/payment-screenshot`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      // Step 3: Show success (no ticket ID shown here)
      setStep(3);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-[500px] rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] overflow-hidden">
        {/* Header */}
        <div className="border-b border-[var(--ev-border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[var(--ev-text)]">
            {step === 1 && "Confirm Registration"}
            {step === 2 && "Upload Payment Proof"}
            {step === 3 && "Registration Successful!"}
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--ev-muted)] hover:text-[var(--ev-text)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-[10px] bg-[var(--ev-danger-bg)] border border-[var(--ev-danger-border)] p-3">
              <p className="text-[13px] text-[var(--ev-danger)]">{error}</p>
            </div>
          )}

          {/* Step 1: Confirm Registration */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-[10px] bg-[var(--ev-elevated)] p-4 space-y-3">
                <div>
                  <p className="text-[12px] text-[var(--ev-muted)] uppercase">Event</p>
                  <p className="text-[16px] font-bold text-[var(--ev-text)]">{event.title}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[var(--ev-muted)] uppercase">Date & Venue</p>
                  <p className="text-[14px] text-[var(--ev-text)]">{formatDate(event.date)} · {event.startTime || ""}</p>
                  <p className="text-[13px] text-[var(--ev-text)]">{event.venue}</p>
                </div>
                {isPaidEvent && (
                  <div>
                    <p className="text-[12px] text-[var(--ev-muted)] uppercase">Ticket Price</p>
                    <p className="text-[24px] font-bold text-[var(--ev-accent)]">PKR {(event.price || 0).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-[12px] text-[var(--ev-muted)] uppercase">Your Name</p>
                  <p className="text-[14px] text-[var(--ev-text)]">{user.name || user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload Payment Proof */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-[10px] bg-[var(--ev-elevated)] p-4">
                <p className="text-[13px] text-[var(--ev-muted)] mb-2">Send payment of</p>
                <p className="text-[24px] font-bold text-[var(--ev-accent)]">PKR {(event.price || 0).toLocaleString()}</p>
                <p className="text-[12px] text-[var(--ev-muted)] mt-3">Transfer the amount via JazzCash, EasyPaisa, or Bank Transfer and upload a screenshot of your payment below.</p>
              </div>

              {/* File Upload Area */}
              <div
                onDrop={handleDragDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-[var(--ev-border)] rounded-[10px] p-6 text-center cursor-pointer hover:border-[var(--ev-accent)] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />

                {filePreview ? (
                  <div className="space-y-3">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="h-24 w-24 mx-auto rounded-[8px] object-cover"
                    />
                    <div>
                      <p className="text-[13px] font-medium text-[var(--ev-text)]">{selectedFile.name}</p>
                      <p className="text-[12px] text-[var(--ev-muted)]">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="text-[12px] text-[var(--ev-accent)] hover:underline"
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-[var(--ev-muted)]" />
                    <p className="text-[14px] font-medium text-[var(--ev-text)]">Drag & drop your screenshot here</p>
                    <p className="text-[12px] text-[var(--ev-muted)]">or click to browse</p>
                    <p className="text-[11px] text-[var(--ev-muted)] mt-2">JPG, PNG or WEBP • Max 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-[var(--ev-success-bg)] p-4">
                  <CheckCircle className="h-12 w-12 text-[var(--ev-success)]" />
                </div>
              </div>

              {isPaidEvent ? (
                <>
                  <div>
                    <p className="text-[20px] font-bold text-[var(--ev-text)] mb-2">Registration Submitted!</p>
                    <p className="text-[14px] text-[var(--ev-muted)]">Your payment proof has been received.</p>
                  </div>

                  <div className="rounded-[10px] bg-[var(--ev-warning-bg)] border border-[var(--ev-warning-border)] p-4 text-left">
                    <p className="text-[13px] text-[var(--ev-warning)] font-medium mb-2">⏳ Awaiting Payment Verification</p>
                    <p className="text-[12px] text-[var(--ev-warning)] opacity-75">
                      Your ticket will be generated once admin verifies your payment. You will be notified when verification is complete.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[20px] font-bold text-[var(--ev-text)] mb-2">Registration Confirmed!</p>
                    <p className="text-[14px] text-[var(--ev-muted)]">Your registration is complete.</p>
                  </div>

                  <div className="rounded-[10px] bg-[var(--ev-success-bg)] border border-[var(--ev-success-border)] p-4 text-left">
                    <p className="text-[13px] text-[var(--ev-success)] font-medium">✓ Your ticket is ready!</p>
                    <p className="text-[12px] text-[var(--ev-success)] opacity-75 mt-1">
                      Check your tickets in "My Registrations" to view and download your ticket.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--ev-border)] px-6 py-4 flex gap-3 justify-end">
          {step === 3 ? (
            <>
              <Button onClick={onClose} className="border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">
                Close
              </Button>
              <Button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]"
              >
                View My Tickets
              </Button>
            </>
          ) : (
            <>
              {step > 1 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  className="border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]"
                  disabled={loading}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              )}
              {step === 1 && (
                <Button onClick={onClose} className="border border-[var(--ev-border)] bg-transparent text-[var(--ev-text)] hover:bg-[var(--ev-border)] rounded-[10px]">
                  Cancel
                </Button>
              )}
              {step === 1 && (
                <Button onClick={handleContinueToPayment} className="bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]" disabled={loading}>
                  {isStep2Required ? (
                    <>
                      Continue to Payment <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
              {step === 2 && (
                <Button
                  onClick={handleSubmitRegistration}
                  className="bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]"
                  disabled={!selectedFile || loading}
                >
                  {loading ? "Submitting..." : "Submit Registration"} <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
