"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import PageHeader from "@/components/ui/PageHeader";
import { CheckCircleIcon } from "@/components/ui/Icons";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const SUBJECTS = [
  "General Inquiry",
  "Store Correction",
  "Partnership",
  "Bug Report",
  "Feature Request",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(
    TURNSTILE_SITE_KEY ? null : "skip"
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const subject = data.get("subject") as string;
    const message = data.get("message") as string;

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:hello@winterstores.co?subject=${encodeURIComponent(
      `[WinterStores] ${subject}`
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  }

  return (
    <div>
      <PageHeader
        width="2xl"
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        title="Contact Us"
        lede={
          <>
            Have a question, found incorrect store info, or want to partner with us?
            We&apos;d love to hear from you.
          </>
        }
      />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <CheckCircleIcon className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
          <p className="text-lg font-semibold text-emerald-900">
            Your email client should have opened.
          </p>
          <p className="mt-2 text-sm text-emerald-800">
            If it didn&apos;t, you can email us directly at{" "}
            <a
              href="mailto:hello@winterstores.co"
              className="font-medium underline"
            >
              hello@winterstores.co
            </a>
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm font-medium text-emerald-800 underline hover:text-emerald-950"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-xs outline-none transition-shadow focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-xs outline-none transition-shadow focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-slate-700"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              required
              className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-xs outline-none transition-shadow focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
            >
              <option value="">Select a subject...</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-slate-700"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-xs outline-none transition-shadow focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
              placeholder="How can we help?"
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

          <button
            type="submit"
            disabled={!turnstileToken}
            className="btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Message
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
