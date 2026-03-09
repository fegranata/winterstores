"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getConsent, setConsent, type CookieConsent as ConsentType } from "@/lib/cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Show banner only if no consent recorded
    const existing = getConsent();
    if (!existing) {
      setVisible(true);
    }
  }, []);

  function accept() {
    const consent: ConsentType = { essential: true, analytics: true, marketing: true };
    setConsent(consent);
    setVisible(false);
  }

  function reject() {
    const consent: ConsentType = { essential: true, analytics: false, marketing: false };
    setConsent(consent);
    setVisible(false);
  }

  function savePreferences() {
    const consent: ConsentType = { essential: true, analytics, marketing };
    setConsent(consent);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
        {!showPreferences ? (
          <>
            <p className="text-sm text-slate-600">
              We use cookies for essential site functionality and, with your consent,
              for analytics and advertising. See our{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={accept}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={reject}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
              >
                Manage Preferences
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Cookie Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-900">Essential</strong> — Required
                  for the site to function (authentication, security)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-900">Analytics</strong> — Help us
                  understand how visitors use the site
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-900">Marketing</strong> — Enable
                  personalized ads from our ad partners
                </span>
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={savePreferences}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
