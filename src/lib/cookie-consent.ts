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
}

export function hasConsented(): boolean {
  return getConsent() !== null;
}
