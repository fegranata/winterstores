import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "public", "og-default.png");

// 1200x630 OG image as SVG → PNG via sharp
const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="40%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="1080" cy="-20" r="140" fill="rgba(255,255,255,0.08)"/>
  <circle cx="60" cy="520" r="100" fill="rgba(255,255,255,0.06)"/>
  <circle cx="200" cy="100" r="60" fill="rgba(255,255,255,0.05)"/>

  <!-- Mountain silhouettes -->
  <polygon points="0,630 200,370 400,630" fill="rgba(255,255,255,0.05)"/>
  <polygon points="300,630 500,330 700,630" fill="rgba(255,255,255,0.07)"/>
  <polygon points="600,630 850,350 1050,630" fill="rgba(255,255,255,0.04)"/>
  <polygon points="900,630 1100,400 1200,480 1200,630" fill="rgba(255,255,255,0.06)"/>

  <!-- Mountain icon -->
  <g transform="translate(380, 150)">
    <polygon points="40,0 76,56 4,56" fill="#FFFFFF"/>
    <polygon points="40,0 50,20 30,20" fill="#93C5FD"/>
    <circle cx="64" cy="8" r="5" fill="#bfdbfe"/>
  </g>

  <!-- "Winter" text -->
  <text x="440" y="230" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
        font-size="72" font-weight="700" fill="#FFFFFF" text-anchor="start"
        letter-spacing="-1">Winter</text>

  <!-- "Stores" text -->
  <text x="700" y="230" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
        font-size="72" font-weight="700" fill="#bfdbfe" text-anchor="start"
        letter-spacing="-1">Stores</text>

  <!-- Tagline line 1 -->
  <text x="600" y="320" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
        font-size="26" font-weight="400" fill="rgba(255,255,255,0.9)" text-anchor="middle">
    Find the best winter sport stores near you.
  </text>

  <!-- Tagline line 2 -->
  <text x="600" y="358" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
        font-size="26" font-weight="400" fill="rgba(255,255,255,0.9)" text-anchor="middle">
    Compare reviews, filter by sport, and discover gear shops worldwide.
  </text>

  <!-- CTA button -->
  <rect x="460" y="400" width="280" height="52" rx="26" fill="#FFFFFF"/>
  <text x="600" y="433" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
        font-size="20" font-weight="600" fill="#1d4ed8" text-anchor="middle">
    Search 1,000+ Stores Free
  </text>

  <!-- Domain -->
  <text x="1160" y="600" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
        font-size="20" font-weight="500" fill="rgba(255,255,255,0.5)" text-anchor="end">
    winterstores.co
  </text>
</svg>`;

await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(outPath);
console.log(`OG image saved to ${outPath}`);
