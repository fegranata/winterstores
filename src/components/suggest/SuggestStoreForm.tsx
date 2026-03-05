"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const SPORT_OPTIONS = [
  "Skiing",
  "Snowboarding",
  "Cross-Country",
  "Ice Skating",
  "Sledding",
  "Snowshoeing",
];

const COUNTRIES = [
  "Austria", "Canada", "Finland", "France", "Germany", "Italy", "Japan",
  "Norway", "Sweden", "Switzerland", "United States", "Other",
];

export default function SuggestStoreForm() {
  const [storeName, setStoreName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [sportTypes, setSportTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(
    TURNSTILE_SITE_KEY ? null : "skip"
  );

  function toggleSport(sport: string) {
    setSportTypes((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/stores/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          city,
          country,
          website,
          sportTypes,
          notes,
          submitterEmail,
          turnstileToken: turnstileToken === "skip" ? undefined : turnstileToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-3xl mb-3">✅</div>
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          Thank you!
        </h2>
        <p className="text-green-700">
          Your store suggestion has been submitted. We&apos;ll review it and add
          it to our directory if it meets our criteria.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setStoreName("");
            setCity("");
            setCountry("");
            setWebsite("");
            setSportTypes([]);
            setNotes("");
            setSubmitterEmail("");
            setTurnstileToken(TURNSTILE_SITE_KEY ? null : "skip");
          }}
          className="mt-4 text-sm text-green-700 underline hover:text-green-900"
        >
          Submit another store
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Store Name */}
      <div>
        <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-1">
          Store Name <span className="text-red-500">*</span>
        </label>
        <input
          id="storeName"
          type="text"
          required
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="e.g. Alpine Ski Shop"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* City + Country */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Innsbruck"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
          Website URL <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Sport Types */}
      <fieldset>
        <legend className="block text-sm font-medium text-slate-700 mb-2">
          Sport Types <span className="text-slate-400">(select all that apply)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {SPORT_OPTIONS.map((sport) => (
            <button
              key={sport}
              type="button"
              onClick={() => toggleSport(sport)}
              className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                sportTypes.includes(sport)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
          Additional Notes <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else we should know about this store?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Your Email <span className="text-slate-400">(optional, for follow-up)</span>
        </label>
        <input
          id="email"
          type="email"
          value={submitterEmail}
          onChange={(e) => setSubmitterEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Turnstile */}
      {TURNSTILE_SITE_KEY && (
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
      )}

      {/* Error */}
      {status === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading" || !turnstileToken}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "loading" ? "Submitting..." : "Submit Store Suggestion"}
      </button>
    </form>
  );
}
