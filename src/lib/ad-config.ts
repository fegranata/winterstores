/**
 * Centralized ad provider configuration.
 * Controlled by NEXT_PUBLIC_AD_PROVIDER env var.
 */

export type AdProvider = "adsense" | "medianet" | "ezoic" | "carbon" | "infolinks" | "none";

export const AD_PROVIDER: AdProvider =
  (process.env.NEXT_PUBLIC_AD_PROVIDER as AdProvider) || "none";

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
export const MEDIANET_CID = process.env.NEXT_PUBLIC_MEDIANET_CUSTOMER_ID || "";
export const EZOIC_SITE_ID = process.env.NEXT_PUBLIC_EZOIC_SITE_ID || "";
export const CARBON_SERVE = process.env.NEXT_PUBLIC_CARBON_SERVE_ID || "";
export const CARBON_PLACEMENT = process.env.NEXT_PUBLIC_CARBON_PLACEMENT || "";
export const INFOLINKS_PID = process.env.NEXT_PUBLIC_INFOLINKS_PID || "";
