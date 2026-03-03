"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface ReportFormProps {
  storeName: string;
  storeSlug: string;
}

const CATEGORIES = [
  "Address or Location",
  "Phone Number",
  "Opening Hours",
  "Rating or Reviews",
  "Services Offered",
  "Other",
];

export default function ReportForm({ storeName, storeSlug }: ReportFormProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!category || !details.trim()) return;

    const subject = encodeURIComponent(`[WinterStores] Report: ${storeName}`);
    const body = encodeURIComponent(
      `Store: ${storeName}\nURL: https://winterstores.com/store/${storeSlug}\nCategory: ${category}\n\nDetails:\n${details}`
    );
    window.open(
      `mailto:corrections@winterstores.com?subject=${subject}&body=${body}`,
      "_self"
    );
    toast("Thank you for your report!", "success");
    setOpen(false);
    setCategory("");
    setDetails("");
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
        Report incorrect info
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">
            What&apos;s incorrect?
          </p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe what's incorrect..."
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!category || !details.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit report
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
