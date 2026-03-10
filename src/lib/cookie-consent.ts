export interface CookieConsent {
  essential: boolean; // always true
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "cookie-consent";

export function getConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function setConsent(consent: CookieConsent): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  applyConsentToGoogle(consent);
}

export function hasConsented(): boolean {
  return getConsent() !== null;
}

/** Push current consent state to Google Consent Mode v2 */
export function applyConsentToGoogle(consent: CookieConsent): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function gtag(...args: any[]) {
    w.dataLayer.push(args);
  }
  gtag("consent", "update", {
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
    analytics_storage: consent.analytics ? "granted" : "denied",
  });
}
