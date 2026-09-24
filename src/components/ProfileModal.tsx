import { useEffect, useState } from "react";
import Modal from "./Modal";
import { useToast } from "../context/ToastContext";
import { useSupabaseAuth } from "../context/SupabaseAuthContext";
import { useDashboard } from "../context/DashboardContext";
import { supabase } from "../lib/supabase";
import { inputClass, labelClass } from "./forms/fields";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: Props) {
  const { user } = useSupabaseAuth();
  const toast = useToast();
  const { setUserName } = useDashboard();
  const email = user?.email ?? "";
  const meta = (user?.user_metadata ?? {}) as Record<string, string>;

  const [displayName, setDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && user) {
      setDisplayName(meta?.name ?? meta?.full_name ?? "");
      setNewEmail("");
      setNewPassword("");
      setError("");
    }
  }, [open, user]);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ data: { name: displayName } });
    setSavingName(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    setUserName(displayName);
    toast.success("Display name updated");
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.includes("@")) {
      setError("Enter a valid email");
      toast.error("Enter a valid email");
      return;
    }
    setSavingEmail(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSavingEmail(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Email update sent — check your inbox to confirm.");
    setNewEmail("");
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    setNewPassword("");
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title="Profile" subtitle="Manage your Aureus account">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-white/40">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-white/90">{email}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Display name</label>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
            <button
              onClick={handleSaveName}
              disabled={savingName || !displayName.trim()}
              className="gold-btn shrink-0 rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingName ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Change email</label>
          <div className="flex gap-2">
            <input
              type="email"
              className={inputClass}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
            />
            <button
              onClick={handleUpdateEmail}
              disabled={savingEmail}
              className="gold-btn shrink-0 rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingEmail ? "Sending…" : "Update"}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-white/35">
            You may need to confirm the change from your inbox.
          </p>
        </div>

        <div>
          <label className={labelClass}>Change password</label>
          <div className="flex gap-2">
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
            />
            <button
              onClick={handleUpdatePassword}
              disabled={savingPassword}
              className="gold-btn shrink-0 rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingPassword ? "Saving…" : "Update"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}