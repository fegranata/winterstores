"use client";

import { useState, Fragment } from "react";
import FilterPanel from "./FilterPanel";
import { SlidersIcon, XIcon } from "@/components/ui/Icons";

export default function MobileFilterDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex h-12 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700 transition-colors"
        aria-expanded={open}
      >
        <SlidersIcon className="h-4 w-4" />
        Filters
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-snow shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-display text-lg font-semibold text-ink-900">Filters</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close filters"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 h-[calc(100%-57px)]">
          <FilterPanel />
        </div>
      </div>
    </Fragment>
  );
}
