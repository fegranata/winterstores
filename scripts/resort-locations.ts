/**
 * Major ski resort locations used for store discovery.
 * Each entry has coordinates, country info, and a region tag for filtering.
 *
 * Usage in discover-stores.ts:
 *   --region "French Alps"     → only search near French Alps resorts
 *   --region "Colorado"        → only search near Colorado resorts
 *   (no flag)                  → search all resorts
 */

export interface ResortLocation {
  name: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export const RESORT_LOCATIONS: ResortLocation[] = [
  // ─── French Alps ────────────────────────────────
  { name: "Chamonix", region: "French Alps", country: "France", countryCode: "FR", lat: 45.9237, lng: 6.8694 },
  { name: "Val d'Isère", region: "French Alps", country: "France", countryCode: "FR", lat: 45.4485, lng: 6.9806 },
  { name: "Courchevel", region: "French Alps", country: "France", countryCode: "FR", lat: 45.4153, lng: 6.6346 },
  { name: "Méribel", region: "French Alps", country: "France", countryCode: "FR", lat: 45.3968, lng: 6.5656 },
  { name: "Les 2 Alpes", region: "French Alps", country: "France", countryCode: "FR", lat: 45.0069, lng: 6.1224 },
  { name: "La Plagne", region: "French Alps", country: "France", countryCode: "FR", lat: 45.5064, lng: 6.6770 },
  { name: "Tignes", region: "French Alps", country: "France", countryCode: "FR", lat: 45.4687, lng: 6.9065 },
  { name: "Morzine", region: "French Alps", country: "France", countryCode: "FR", lat: 46.1808, lng: 6.7093 },
  { name: "Les Gets", region: "French Alps", country: "France", countryCode: "FR", lat: 46.1590, lng: 6.6688 },
  { name: "Avoriaz", region: "French Alps", country: "France", countryCode: "FR", lat: 46.1916, lng: 6.7750 },
  { name: "La Clusaz", region: "French Alps", country: "France", countryCode: "FR", lat: 45.9040, lng: 6.4233 },
  { name: "Megève", region: "French Alps", country: "France", countryCode: "FR", lat: 45.8567, lng: 6.6174 },

  // ─── Swiss Alps ─────────────────────────────────
  { name: "Zermatt", region: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.0207, lng: 7.7491 },
  { name: "St. Moritz", region: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.4908, lng: 9.8355 },
  { name: "Verbier", region: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.0965, lng: 7.2282 },
  { name: "Davos", region: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.8003, lng: 9.8361 },
  { name: "Laax", region: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.8096, lng: 9.2580 },
  { name: "Wengen", region: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.6087, lng: 7.9222 },
  { name: "Grindelwald", region: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.6240, lng: 8.0413 },
  { name: "Crans-Montana", region: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.3072, lng: 7.4817 },

  // ─── Austrian Alps ──────────────────────────────
  { name: "Innsbruck", region: "Austrian Alps", country: "Austria", countryCode: "AT", lat: 47.2692, lng: 11.4041 },
  { name: "St. Anton", region: "Austrian Alps", country: "Austria", countryCode: "AT", lat: 47.1274, lng: 10.2682 },
  { name: "Kitzbühel", region: "Austrian Alps", country: "Austria", countryCode: "AT", lat: 47.4561, lng: 12.3925 },
  { name: "Ischgl", region: "Austrian Alps", country: "Austria", countryCode: "AT", lat: 47.0149, lng: 10.2941 },
  { name: "Sölden", region: "Austrian Alps", country: "Austria", countryCode: "AT", lat: 46.9659, lng: 10.8764 },
  { name: "Lech", region: "Austrian Alps", country: "Austria", countryCode: "AT", lat: 47.2084, lng: 10.1420 },
  { name: "Mayrhofen", region: "Austrian Alps", country: "Austria", countryCode: "AT", lat: 47.1590, lng: 11.8607 },
  { name: "Saalbach", region: "Austrian Alps", country: "Austria", countryCode: "AT", lat: 47.3909, lng: 12.6367 },

  // ─── Italian Alps / Dolomites ───────────────────
  { name: "Cortina d'Ampezzo", region: "Italian Dolomites", country: "Italy", countryCode: "IT", lat: 46.5369, lng: 12.1357 },
  { name: "Val Gardena", region: "Italian Dolomites", country: "Italy", countryCode: "IT", lat: 46.5590, lng: 11.7308 },
  { name: "Madonna di Campiglio", region: "Italian Dolomites", country: "Italy", countryCode: "IT", lat: 46.2297, lng: 10.8267 },
  { name: "Livigno", region: "Italian Dolomites", country: "Italy", countryCode: "IT", lat: 46.5388, lng: 10.1360 },
  { name: "Courmayeur", region: "Italian Dolomites", country: "Italy", countryCode: "IT", lat: 45.7966, lng: 6.9690 },

  // ─── Germany ────────────────────────────────────
  { name: "Garmisch-Partenkirchen", region: "Germany", country: "Germany", countryCode: "DE", lat: 47.5000, lng: 11.0800 },
  { name: "Oberstdorf", region: "Germany", country: "Germany", countryCode: "DE", lat: 47.4077, lng: 10.2789 },

  // ─── Scandinavia ────────────────────────────────
  { name: "Åre", region: "Scandinavia", country: "Sweden", countryCode: "SE", lat: 63.3989, lng: 13.0806 },
  { name: "Trysil", region: "Scandinavia", country: "Norway", countryCode: "NO", lat: 61.3153, lng: 12.2637 },
  { name: "Hemsedal", region: "Scandinavia", country: "Norway", countryCode: "NO", lat: 60.8564, lng: 8.4067 },
  { name: "Levi", region: "Scandinavia", country: "Finland", countryCode: "FI", lat: 67.7998, lng: 24.8126 },
  { name: "Ruka", region: "Scandinavia", country: "Finland", countryCode: "FI", lat: 66.1628, lng: 29.1544 },

  // ─── Colorado ───────────────────────────────────
  { name: "Vail", region: "Colorado", country: "United States", countryCode: "US", lat: 39.6403, lng: -106.3742 },
  { name: "Aspen", region: "Colorado", country: "United States", countryCode: "US", lat: 39.1911, lng: -106.8175 },
  { name: "Breckenridge", region: "Colorado", country: "United States", countryCode: "US", lat: 39.4817, lng: -106.0384 },
  { name: "Steamboat Springs", region: "Colorado", country: "United States", countryCode: "US", lat: 40.4850, lng: -106.8317 },
  { name: "Telluride", region: "Colorado", country: "United States", countryCode: "US", lat: 37.9375, lng: -107.8123 },
  { name: "Winter Park", region: "Colorado", country: "United States", countryCode: "US", lat: 39.8841, lng: -105.7625 },
  { name: "Crested Butte", region: "Colorado", country: "United States", countryCode: "US", lat: 38.8697, lng: -106.9878 },

  // ─── Utah ───────────────────────────────────────
  { name: "Park City", region: "Utah", country: "United States", countryCode: "US", lat: 40.6461, lng: -111.4980 },
  { name: "Alta / Snowbird", region: "Utah", country: "United States", countryCode: "US", lat: 40.5884, lng: -111.6386 },

  // ─── Other US West ──────────────────────────────
  { name: "Jackson Hole", region: "US West", country: "United States", countryCode: "US", lat: 43.5877, lng: -110.8279 },
  { name: "Mammoth Mountain", region: "US West", country: "United States", countryCode: "US", lat: 37.6308, lng: -119.0326 },
  { name: "Lake Tahoe", region: "US West", country: "United States", countryCode: "US", lat: 39.0968, lng: -120.0324 },
  { name: "Sun Valley", region: "US West", country: "United States", countryCode: "US", lat: 43.6975, lng: -114.3514 },
  { name: "Big Sky", region: "US West", country: "United States", countryCode: "US", lat: 45.2833, lng: -111.4014 },

  // ─── US East ────────────────────────────────────
  { name: "Stowe", region: "US East", country: "United States", countryCode: "US", lat: 44.4654, lng: -72.6874 },
  { name: "Killington", region: "US East", country: "United States", countryCode: "US", lat: 43.6045, lng: -72.7965 },
  { name: "Sunday River", region: "US East", country: "United States", countryCode: "US", lat: 44.4734, lng: -70.8564 },

  // ─── BC / Alberta ───────────────────────────────
  { name: "Whistler", region: "BC / Alberta", country: "Canada", countryCode: "CA", lat: 50.1163, lng: -122.9574 },
  { name: "Banff", region: "BC / Alberta", country: "Canada", countryCode: "CA", lat: 51.1784, lng: -115.5708 },
  { name: "Revelstoke", region: "BC / Alberta", country: "Canada", countryCode: "CA", lat: 50.9981, lng: -118.1957 },
  { name: "Fernie", region: "BC / Alberta", country: "Canada", countryCode: "CA", lat: 49.5040, lng: -115.0631 },
  { name: "Mont Tremblant", region: "BC / Alberta", country: "Canada", countryCode: "CA", lat: 46.2108, lng: -74.5842 },

  // ─── Japan ──────────────────────────────────────
  { name: "Niseko", region: "Japan", country: "Japan", countryCode: "JP", lat: 42.8625, lng: 140.6990 },
  { name: "Hakuba", region: "Japan", country: "Japan", countryCode: "JP", lat: 36.6983, lng: 137.8617 },
  { name: "Nozawa Onsen", region: "Japan", country: "Japan", countryCode: "JP", lat: 36.9237, lng: 138.6271 },
  { name: "Myoko", region: "Japan", country: "Japan", countryCode: "JP", lat: 36.8625, lng: 138.8563 },
  { name: "Furano", region: "Japan", country: "Japan", countryCode: "JP", lat: 43.3383, lng: 142.3828 },
  { name: "Rusutsu", region: "Japan", country: "Japan", countryCode: "JP", lat: 42.7474, lng: 140.5568 },

  // ─── Eastern Europe ─────────────────────────────
  { name: "Zakopane", region: "Eastern Europe", country: "Poland", countryCode: "PL", lat: 49.2992, lng: 19.9496 },
  { name: "Bansko", region: "Eastern Europe", country: "Bulgaria", countryCode: "BG", lat: 41.8382, lng: 23.4883 },
  { name: "Poiana Brașov", region: "Eastern Europe", country: "Romania", countryCode: "RO", lat: 45.5943, lng: 25.5550 },

  // ─── South America ──────────────────────────────
  { name: "Bariloche", region: "South America", country: "Argentina", countryCode: "AR", lat: -41.1335, lng: -71.3103 },
  { name: "Portillo", region: "South America", country: "Chile", countryCode: "CL", lat: -32.8377, lng: -70.1311 },
  { name: "Valle Nevado", region: "South America", country: "Chile", countryCode: "CL", lat: -33.3550, lng: -70.2580 },

  // ─── Oceania ────────────────────────────────────
  { name: "Queenstown", region: "Oceania", country: "New Zealand", countryCode: "NZ", lat: -45.0312, lng: 168.6626 },
  { name: "Thredbo", region: "Oceania", country: "Australia", countryCode: "AU", lat: -36.5058, lng: 148.3064 },

  // ─── Iberia / Andorra ───────────────────────────
  { name: "Sierra Nevada", region: "Iberia", country: "Spain", countryCode: "ES", lat: 37.0956, lng: -3.3954 },
  { name: "Baqueira-Beret", region: "Iberia", country: "Spain", countryCode: "ES", lat: 42.6939, lng: 0.9400 },
  { name: "Grandvalira", region: "Iberia", country: "Andorra", countryCode: "AD", lat: 42.5063, lng: 1.5218 },

  // ─── Other Europe ───────────────────────────────
  { name: "Kranjska Gora", region: "Other Europe", country: "Slovenia", countryCode: "SI", lat: 46.4845, lng: 13.7858 },
  { name: "Aviemore", region: "Scotland", country: "United Kingdom", countryCode: "GB", lat: 57.1953, lng: -3.8258 },

  // ─── Asia ───────────────────────────────────────
  { name: "Yongpyong", region: "Asia", country: "South Korea", countryCode: "KR", lat: 37.6440, lng: 128.6804 },
];
