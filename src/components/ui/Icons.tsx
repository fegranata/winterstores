/**
 * WinterStores icon set.
 *
 * Hand-drawn 24×24 stroke icons (1.75 stroke, round caps) so the UI needs no
 * icon dependency and no emoji. Plain functions with no hooks: usable from
 * server and client components alike. Decorative by default (aria-hidden);
 * pass `title` to make one announce itself.
 */
import type { ReactNode, SVGProps } from "react";
import type { ServiceType, SportType } from "@/types/store";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  title?: string;
}

function Svg({ title, className = "h-4 w-4", strokeWidth = 1.75, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/* ── General UI ─────────────────────────────────────────── */

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20.5 20.5 16 16" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21.5s-7-6.1-7-11.5a7 7 0 0 1 14 0c0 5.4-7 11.5-7 11.5Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);

export const NavigationIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 11 20.5 3.5 13 20.5l-2-7.5-7.5-2Z" />
  </Svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m15 5-7 7 7 7" />
  </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Svg>
);

export const ArrowUpRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.8 2.8L16.5 9.5" />
  </Svg>
);

export const VerifiedIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.8 19.5 6v5.5c0 4.6-3.2 8.3-7.5 9.7-4.3-1.4-7.5-5.1-7.5-9.7V6L12 2.8Z" />
    <path d="m8.8 12 2.3 2.3 4.2-4.6" />
  </Svg>
);

export const XIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20s-8-4.7-8-10.6A4.4 4.4 0 0 1 8.4 5c1.6 0 2.9.8 3.6 2.1C12.7 5.8 14 5 15.6 5A4.4 4.4 0 0 1 20 9.4C20 15.3 12 20 12 20Z" />
  </Svg>
);

export const ShoppingBagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 8h14l-1 12.5H6L5 8Z" />
    <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5C10.7 20 4 13.3 3.5 5.1A1.5 1.5 0 0 1 5 3.5Z" />
  </Svg>
);

export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </Svg>
);

export const TagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.7 6.7a1.4 1.4 0 0 1-2 0l-8.3-8.3Z" />
    <circle cx="8" cy="8" r="1.4" />
  </Svg>
);

export const FlagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 21V4M5 4.5c4-2 7 2 11 0 1-.5 2-.5 3 0v9c-1-.5-2-.5-3 0-4 2-7-2-11 0" />
  </Svg>
);

export const ListIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r=".6" fill="currentColor" />
    <circle cx="4.5" cy="12" r=".6" fill="currentColor" />
    <circle cx="4.5" cy="18" r=".6" fill="currentColor" />
  </Svg>
);

export const MapIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3.5 6 5.5-2.5 6 2.5 5.5-2.5v14.5L15 20.5 9 18l-5.5 2.5V6Z" />
    <path d="M9 3.5V18M15 6v14.5" />
  </Svg>
);

export const SlidersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Svg>
);

export const ScaleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v16M7 20h10M5 7h14M12 4l0 3" />
    <path d="m5 7-2.5 6a3 3 0 0 0 5 0L5 7ZM19 7l-2.5 6a3 3 0 0 0 5 0L19 7Z" />
  </Svg>
);

export const CompassIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
  </Svg>
);

export const BookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 6.5C10.3 5 8 4.5 4 4.5v13c4 0 6.3.5 8 2 1.7-1.5 4-2 8-2v-13c-4 0-6.3.5-8 2Z" />
    <path d="M12 6.5v13" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const SnowflakeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5" />
    <path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2M4.2 10.4l3-.6-1-3M19.8 13.6l-3 .6 1 3M4.2 13.6l3 .6-1 3M19.8 10.4l-3-.6 1-3" />
  </Svg>
);

export const MountainIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m2.5 20 6.5-11 3.5 5.5L15 11l6.5 9h-19Z" />
    <path d="m7 11.6 2-1 1.6 1.6" />
  </Svg>
);

export const LayersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3.5 9 4.5-9 4.5L3 8l9-4.5Z" />
    <path d="m3 12.5 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Svg>
);

export const CodeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const ImageIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4 18 5-4.5 3.5 3 3-2.5L20 18" />
  </Svg>
);

export const PenIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m15 4.5 4.5 4.5L8.5 20H4v-4.5L15 4.5Z" />
  </Svg>
);

/* Filled star — shared by ratings, filters and map popups. */
export function StarIcon({ className = "h-4 w-4", title, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      <path d="M12 2.6l2.85 5.95 6.55.8-4.8 4.53 1.2 6.5L12 17.2l-5.8 3.18 1.2-6.5L2.6 9.35l6.55-.8L12 2.6Z" />
    </svg>
  );
}

/* ── Sports ─────────────────────────────────────────────── */

export const SkiingIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="16" cy="4.5" r="1.8" />
    <path d="m7.5 8 4.5 1.5 2.5 3-3 3" />
    <path d="M12 9.5 15 8" />
    <path d="m3 16 17 5" />
    <path d="M6 5.5 9 18" />
  </Svg>
);

export const SnowboardingIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="13.5" cy="4.5" r="1.8" />
    <path d="m8 10.5 4-2.5 3 3-2 4" />
    <path d="m15 11 3.5.5" />
    <path d="M3.5 19.5c3.5 1.3 13.5-1 17-4.5" />
  </Svg>
);

export const CrossCountryIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="4" r="1.8" />
    <path d="M12 7v5.5l-3 5M12 12.5l3.5 5" />
    <path d="M9 9 6.5 18M15 9l2.5 9" />
    <path d="M2.5 20.5h8M13.5 20.5h8" />
  </Svg>
);

export const IceSkatingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3.5h5v6l6 2.4a2.4 2.4 0 0 1 1.5 2.2V17H6V3.5Z" />
    <path d="M11 7h-2M11 10H9" />
    <path d="M3.5 20.5H19a2 2 0 0 0 2-2" />
    <path d="M9 17v3.5M15 17v3.5" />
  </Svg>
);

export const SleddingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 13.5h13" />
    <path d="M2.5 18H18a3.5 3.5 0 0 0 3.5-3.5" />
    <path d="M7 13.5V18M14 13.5V18" />
    <path d="M6 13.5 8 9h7l2 4.5" />
  </Svg>
);

export const SnowshoeingIcon = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="12" cy="12" rx="5.5" ry="9" />
    <path d="M7.5 8.5h9M6.8 12h10.4M7.5 15.5h9M12 3v18" />
  </Svg>
);

export const IceClimbingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 5c3.5-.9 7.5-.6 11 1" />
    <path d="M17.5 6 20 8.5" />
    <path d="m12.5 4.6-2 15.9" />
    <path d="M9.5 20.5h2" />
  </Svg>
);

export const BiathlonIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </Svg>
);

const SPORT_ICON_MAP: Record<SportType, (p: IconProps) => React.JSX.Element> = {
  skiing: SkiingIcon,
  snowboarding: SnowboardingIcon,
  "cross-country": CrossCountryIcon,
  "ice-skating": IceSkatingIcon,
  sledding: SleddingIcon,
  snowshoeing: SnowshoeingIcon,
  "ice-climbing": IceClimbingIcon,
  biathlon: BiathlonIcon,
};

export function SportIcon({ sport, ...p }: IconProps & { sport: SportType }) {
  const Icon = SPORT_ICON_MAP[sport] ?? SnowflakeIcon;
  return <Icon {...p} />;
}

/* ── Services ───────────────────────────────────────────── */

export const RentalsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8" cy="15.5" r="4" />
    <path d="m11 12.5 8.5-8.5M16.5 7l2.5 2.5M14 9.5l2 2" />
  </Svg>
);

export const RepairsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 5.5a4.2 4.2 0 0 0-5.3 5.3l-5.6 5.6a1.9 1.9 0 0 0 2.7 2.7l5.6-5.6a4.2 4.2 0 0 0 5.3-5.3l-2.6 2.6-2.4-.3-.3-2.4 2.6-2.6Z" />
  </Svg>
);

export const LessonsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m2.5 9 9.5-4.5L21.5 9 12 13.5 2.5 9Z" />
    <path d="M6.5 11v4.8c3 2.3 8 2.3 11 0V11M21.5 9v5" />
  </Svg>
);

export const CustomFittingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 16.5 16.5 3l4.5 4.5L7.5 21 3 16.5Z" />
    <path d="m7.5 12 2 2M10.5 9l2 2M13.5 6l2 2" />
  </Svg>
);

export const BootFittingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3.5h6V11l5 2a3 3 0 0 1 2 2.8v3.7H5V5.5a2 2 0 0 1 2-2Z" />
    <path d="M5 15.5h15M9 7h4M9 10h4" />
  </Svg>
);

export const WaxingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z" />
    <path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5" />
  </Svg>
);

export const StorageIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1" />
    <path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5M10 12.5h4" />
  </Svg>
);

export const UsedGearIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 11a8 8 0 0 0-14.3-4.3L3.5 9" />
    <path d="M3.5 4v5h5" />
    <path d="M4 13a8 8 0 0 0 14.3 4.3l2.2-2.3" />
    <path d="M20.5 20v-5h-5" />
  </Svg>
);

const SERVICE_ICON_MAP: Record<ServiceType, (p: IconProps) => React.JSX.Element> = {
  rentals: RentalsIcon,
  repairs: RepairsIcon,
  lessons: LessonsIcon,
  "custom-fitting": CustomFittingIcon,
  "boot-fitting": BootFittingIcon,
  waxing: WaxingIcon,
  storage: StorageIcon,
  "used-gear": UsedGearIcon,
};

export function ServiceIcon({ service, ...p }: IconProps & { service: ServiceType }) {
  const Icon = SERVICE_ICON_MAP[service] ?? CheckIcon;
  return <Icon {...p} />;
}
