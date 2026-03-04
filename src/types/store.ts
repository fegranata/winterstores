export type SportType =
  | "skiing"
  | "snowboarding"
  | "cross-country"
  | "ice-skating"
  | "sledding"
  | "snowshoeing"
  | "ice-climbing"
  | "biathlon";

export type ServiceType =
  | "rentals"
  | "repairs"
  | "lessons"
  | "custom-fitting"
  | "boot-fitting"
  | "waxing"
  | "storage"
  | "used-gear";

export type ReviewPlatform = "google" | "yelp" | "winterstores";

export interface PlatformRating {
  platform: "google" | "yelp";
  rating: number | null;
  reviewCount: number | null;
  platformUrl: string | null;
  fetchedAt: string;
  isExpired: boolean;
}

export interface Review {
  id: string;
  storeId: string;
  userId?: string | null;
  source: ReviewPlatform;
  authorName: string;
  rating: number;
  title?: string | null;
  text: string;
  date: string;
  language: string;
  isVerified: boolean;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  description: string;

  // Location
  address: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  postalCode: string;
  latitude: number;
  longitude: number;

  // Classification
  sportTypes: SportType[];
  services: ServiceType[];
  priceLevel: 1 | 2 | 3;

  // Online presence
  website: string | null;
  hasOnlineShop: boolean;
  onlineShopUrl: string | null;
  phone: string | null;
  email: string | null;

  // Ratings
  winterstoresScore: number;
  totalReviewCount: number;

  // Platform linking
  googlePlaceId: string | null;
  yelpBusinessId: string | null;
  facebookPageId: string | null;
  foursquareVenueId: string | null;

  // Media
  photos: string[];
  coverPhoto: string | null;

  // Meta
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSearchParams {
  q?: string;
  sport?: SportType | SportType[];
  service?: ServiceType | ServiceType[];
  lat?: number;
  lng?: number;
  distance?: number; // km
  minRating?: number;
  hasOnlineShop?: boolean;
  priceLevel?: number;
  country?: string;
  sort?: "closest" | "highest-rated" | "most-reviewed" | "newest";
  page?: number;
  limit?: number;
}

export interface StoreSearchResult {
  stores: (Store & { distance?: number })[];
  total: number;
  page: number;
  totalPages: number;
}

export const SPORT_LABELS: Record<SportType, string> = {
  skiing: "Skiing",
  snowboarding: "Snowboarding",
  "cross-country": "Cross-Country",
  "ice-skating": "Ice Skating",
  sledding: "Sledding",
  snowshoeing: "Snowshoeing",
  "ice-climbing": "Ice Climbing",
  biathlon: "Biathlon",
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  rentals: "Rentals",
  repairs: "Repairs",
  lessons: "Lessons",
  "custom-fitting": "Custom Fitting",
  "boot-fitting": "Boot Fitting",
  waxing: "Waxing",
  storage: "Storage",
  "used-gear": "Used Gear",
};

export const SPORT_ICONS: Record<SportType, string> = {
  skiing: "\u26f7\ufe0f",
  snowboarding: "\ud83c\udfc2",
  "cross-country": "\ud83c\udfbf",
  "ice-skating": "\u26f8\ufe0f",
  sledding: "\ud83d\udef7",
  snowshoeing: "\ud83e\uddb6",
  "ice-climbing": "\ud83e\uddd7",
  biathlon: "\ud83c\udfaf",
};

export const PLATFORM_LABELS: Record<
  "google" | "yelp" | "facebook" | "foursquare",
  string
> = {
  google: "Google",
  yelp: "Yelp",
  facebook: "Facebook",
  foursquare: "Foursquare",
};
