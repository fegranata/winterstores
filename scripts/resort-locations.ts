/**
 * Major ski resort locations used for store discovery.
 * Each entry has coordinates and search queries to find nearby winter sport shops.
 */

export interface ResortLocation {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export const RESORT_LOCATIONS: ResortLocation[] = [
  // ─── Alps ─────────────────────────────────────
  { name: "Chamonix", country: "France", countryCode: "FR", lat: 45.9237, lng: 6.8694 },
  { name: "Val d'Isère", country: "France", countryCode: "FR", lat: 45.4485, lng: 6.9806 },
  { name: "Courchevel", country: "France", countryCode: "FR", lat: 45.4153, lng: 6.6346 },
  { name: "Zermatt", country: "Switzerland", countryCode: "CH", lat: 46.0207, lng: 7.7491 },
  { name: "St. Moritz", country: "Switzerland", countryCode: "CH", lat: 46.4908, lng: 9.8355 },
  { name: "Verbier", country: "Switzerland", countryCode: "CH", lat: 46.0965, lng: 7.2282 },
  { name: "Innsbruck", country: "Austria", countryCode: "AT", lat: 47.2692, lng: 11.4041 },
  { name: "St. Anton", country: "Austria", countryCode: "AT", lat: 47.1274, lng: 10.2682 },
  { name: "Kitzbühel", country: "Austria", countryCode: "AT", lat: 47.4561, lng: 6.3625 },
  { name: "Cortina d'Ampezzo", country: "Italy", countryCode: "IT", lat: 46.5369, lng: 12.1357 },
  { name: "Val Gardena", country: "Italy", countryCode: "IT", lat: 46.5590, lng: 11.7308 },
  { name: "Garmisch-Partenkirchen", country: "Germany", countryCode: "DE", lat: 47.5000, lng: 11.0800 },

  // ─── Scandinavia ──────────────────────────────
  { name: "Åre", country: "Sweden", countryCode: "SE", lat: 63.3989, lng: 13.0806 },
  { name: "Trysil", country: "Norway", countryCode: "NO", lat: 61.3153, lng: 12.2637 },
  { name: "Hemsedal", country: "Norway", countryCode: "NO", lat: 60.8564, lng: 8.4067 },
  { name: "Levi", country: "Finland", countryCode: "FI", lat: 67.7998, lng: 24.8126 },

  // ─── North America ────────────────────────────
  { name: "Vail", country: "United States", countryCode: "US", lat: 39.6403, lng: -106.3742 },
  { name: "Aspen", country: "United States", countryCode: "US", lat: 39.1911, lng: -106.8175 },
  { name: "Park City", country: "United States", countryCode: "US", lat: 40.6461, lng: -111.4980 },
  { name: "Jackson Hole", country: "United States", countryCode: "US", lat: 43.5877, lng: -110.8279 },
  { name: "Mammoth Mountain", country: "United States", countryCode: "US", lat: 37.6308, lng: -119.0326 },
  { name: "Stowe", country: "United States", countryCode: "US", lat: 44.4654, lng: -72.6874 },
  { name: "Lake Tahoe", country: "United States", countryCode: "US", lat: 39.0968, lng: -120.0324 },
  { name: "Breckenridge", country: "United States", countryCode: "US", lat: 39.4817, lng: -106.0384 },
  { name: "Whistler", country: "Canada", countryCode: "CA", lat: 50.1163, lng: -122.9574 },
  { name: "Banff", country: "Canada", countryCode: "CA", lat: 51.1784, lng: -115.5708 },
  { name: "Mont Tremblant", country: "Canada", countryCode: "CA", lat: 46.2108, lng: -74.5842 },

  // ─── Japan ────────────────────────────────────
  { name: "Niseko", country: "Japan", countryCode: "JP", lat: 42.8625, lng: 140.6990 },
  { name: "Hakuba", country: "Japan", countryCode: "JP", lat: 36.6983, lng: 137.8617 },
  { name: "Nozawa Onsen", country: "Japan", countryCode: "JP", lat: 36.9237, lng: 138.6271 },

  // ─── Eastern Europe ───────────────────────────
  { name: "Zakopane", country: "Poland", countryCode: "PL", lat: 49.2992, lng: 19.9496 },
  { name: "Bansko", country: "Bulgaria", countryCode: "BG", lat: 41.8382, lng: 23.4883 },
  { name: "Poiana Brașov", country: "Romania", countryCode: "RO", lat: 45.5943, lng: 25.5550 },

  // ─── South America ────────────────────────────
  { name: "Bariloche", country: "Argentina", countryCode: "AR", lat: -41.1335, lng: -71.3103 },
  { name: "Portillo", country: "Chile", countryCode: "CL", lat: -32.8377, lng: -70.1311 },

  // ─── Oceania ──────────────────────────────────
  { name: "Queenstown", country: "New Zealand", countryCode: "NZ", lat: -45.0312, lng: 168.6626 },
  { name: "Thredbo", country: "Australia", countryCode: "AU", lat: -36.5058, lng: 148.3064 },

  // ─── Other Europe ─────────────────────────────
  { name: "Sierra Nevada", country: "Spain", countryCode: "ES", lat: 37.0956, lng: -3.3954 },
  { name: "Andorra la Vella", country: "Andorra", countryCode: "AD", lat: 42.5063, lng: 1.5218 },
  { name: "Kranjska Gora", country: "Slovenia", countryCode: "SI", lat: 46.4845, lng: 13.7858 },

  // ─── Asia ─────────────────────────────────────
  { name: "Yongpyong", country: "South Korea", countryCode: "KR", lat: 37.6440, lng: 128.6804 },
];
