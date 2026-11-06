"use client";

import { SnowflakeIcon } from "@/components/ui/Icons";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-md">
        <SnowflakeIcon className="h-8 w-8" />
      </span>
      <h1 className="mt-6 heading-display text-4xl text-ink-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-slate-500">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-8 btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
