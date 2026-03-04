"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DeleteAccountModalProps {
  onClose: () => void;
}

export default function DeleteAccountModal({
  onClose,
}: DeleteAccountModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out on client side too
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();

      // Redirect to homepage
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Delete Account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete your account? This action{" "}
          <strong>cannot be undone</strong>.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-slate-500">
          <li>• Your profile will be permanently removed</li>
          <li>• Your reviews will be anonymized (content kept, name removed)</li>
          <li>• You will be signed out immediately</li>
        </ul>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-2">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deleting ? "Deleting..." : "Yes, Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
