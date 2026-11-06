import Breadcrumbs, { type Crumb } from "./Breadcrumbs";

interface PageHeaderProps {
  crumbs: Crumb[];
  title: React.ReactNode;
  /** Rendered as the paragraph under the h1. */
  lede?: React.ReactNode;
  /** Extra content inside the band, below the lede. */
  children?: React.ReactNode;
  /** Container width: wide pages use 7xl, reading pages narrower. */
  width?: "7xl" | "4xl" | "3xl" | "2xl";
}

const WIDTHS = {
  "7xl": "max-w-7xl",
  "4xl": "max-w-4xl",
  "3xl": "max-w-3xl",
  "2xl": "max-w-2xl",
};

/** Light header band shared by index, browse and content pages. */
export default function PageHeader({ crumbs, title, lede, children, width = "7xl" }: PageHeaderProps) {
  return (
    <section className="border-b border-slate-200 bg-white bg-header-wash">
      <div className={`mx-auto ${WIDTHS[width]} px-4 pt-6 pb-10 sm:px-6 sm:pb-12 lg:px-8`}>
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-6 heading-display text-4xl text-ink-900 sm:text-5xl">{title}</h1>
        {lede && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{lede}</p>}
        {children}
      </div>
    </section>
  );
}
