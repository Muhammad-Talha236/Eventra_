import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentId, setStudentId] = useState(user?.studentInfo?.studentId || "");
  const [department, setDepartment] = useState(user?.studentInfo?.department || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }
    
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }
      if (!newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your new password";
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const payload = { name };
      if (newPassword) payload.password = newPassword;
      if (studentId || department) payload.studentInfo = { studentId, department };
      await api.put("/auth/profile", payload);
      toast.success("Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ev-text)]">Profile</h1>
        <p className="mt-1 text-[14px] text-[var(--ev-muted)]">Manage your personal information.</p>
      </div>
      <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-[var(--ev-accent-border)]">
            <AvatarFallback className="bg-[var(--ev-accent)] text-xl font-bold text-white">{user?.name?.split(" ").map((s) => s[0]).join("") || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[20px] font-bold text-[var(--ev-text)]">{user?.name}</p>
            <p className="text-[13px] text-[var(--ev-muted)]">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-name" className="text-[13px] text-[var(--ev-muted)]">Full name *</Label>
            <Input id="p-name" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({...errors, name: ""}); }} className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
            {errors.name && <p className="mt-1 text-[12px] text-[var(--ev-danger)]">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="p-email" className="text-[13px] text-[var(--ev-muted)]">Email</Label>
            <Input id="p-email" defaultValue={user?.email} disabled className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)] opacity-50" />
          </div>
          <div>
            <Label htmlFor="p-sid" className="text-[13px] text-[var(--ev-muted)]">Student ID</Label>
            <Input id="p-sid" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
          </div>
          <div>
            <Label htmlFor="p-dept" className="text-[13px] text-[var(--ev-muted)]">Department</Label>
            <Input id="p-dept" value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" />
          </div>
          
          {/* Password section */}
          <div className="sm:col-span-2">
            <h3 className="mb-3 text-[14px] font-semibold text-[var(--ev-text)]">Change Password (optional)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="p-curr-pw" className="text-[13px] text-[var(--ev-muted)]">Current Password</Label>
                <Input id="p-curr-pw" type="password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); if (errors.currentPassword) setErrors({...errors, currentPassword: ""}); }} className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" placeholder="••••••••" />
                {errors.currentPassword && <p className="mt-1 text-[12px] text-[var(--ev-danger)]">{errors.currentPassword}</p>}
              </div>
              <div>
                <Label htmlFor="p-new-pw" className="text-[13px] text-[var(--ev-muted)]">New Password</Label>
                <Input id="p-new-pw" type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors({...errors, newPassword: ""}); }} className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" placeholder="••••••••" />
                {errors.newPassword && <p className="mt-1 text-[12px] text-[var(--ev-danger)]">{errors.newPassword}</p>}
              </div>
              <div>
                <Label htmlFor="p-conf-pw" className="text-[13px] text-[var(--ev-muted)]">Confirm New Password</Label>
                <Input id="p-conf-pw" type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""}); }} className="mt-1.5 h-11 bg-[var(--ev-elevated)] border-[var(--ev-border)]" placeholder="••••••••" />
                {errors.confirmPassword && <p className="mt-1 text-[12px] text-[var(--ev-danger)]">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving} className="w-full bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px]">{saving ? "Saving..." : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
