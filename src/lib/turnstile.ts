const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  // Skip verification in dev or if secret key is not configured
  if (!TURNSTILE_SECRET_KEY) return true;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );

    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
