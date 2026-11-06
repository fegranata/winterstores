import Link from "next/link";
import { MountainIcon } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-md">
        <MountainIcon className="h-8 w-8" />
      </span>
      <h1 className="mt-6 heading-display text-4xl text-ink-900">Page not found</h1>
      <p className="mt-2 text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 btn-primary"
      >
        Go home
      </Link>
    </div>
  );
}
