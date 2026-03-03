"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-5xl">❄️</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-slate-500">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
