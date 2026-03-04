"use client";

import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Fran\u00e7ais" },
  { code: "es", label: "Espa\u00f1ol" },
  { code: "nl", label: "Nederlands" },
  { code: "no", label: "Norsk" },
  { code: "sv", label: "Svenska" },
  { code: "ja", label: "\u65e5\u672c\u8a9e" },
];

interface ProfileSettingsProps {
  initialDisplayName: string;
  initialLanguage: string;
  onDeleteAccount: () => void;
}

export default function ProfileSettings({
  initialDisplayName,
  initialLanguage,
  onDeleteAccount,
}: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [language, setLanguage] = useState(initialLanguage);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, language }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    displayName !== initialDisplayName || language !== initialLanguage;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Settings</h2>

      {/* Profile Settings Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        {/* Display Name */}
        <div>
          <label
            htmlFor="display-name"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Display Name
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Your display name"
          />
        </div>

        {/* Language */}
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Saved!
            </span>
          )}
          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
        <h3 className="font-semibold text-red-800">Danger Zone</h3>
        <p className="mt-1 text-sm text-red-600">
          Permanently delete your account and all associated data. Your reviews
          will be anonymized but not removed.
        </p>
        <button
          onClick={onDeleteAccount}
          className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
