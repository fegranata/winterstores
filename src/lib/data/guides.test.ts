import { describe, expect, it } from "vitest";
import { GUIDES, getGuidesForStore } from "./guides";
import type { ServiceType, SportType } from "@/types/store";

const store = (services: ServiceType[], sportTypes: SportType[] = ["skiing"]) => ({
  services,
  sportTypes,
});

const slugs = (services: ServiceType[], sportTypes?: SportType[]) =>
  getGuidesForStore(store(services, sportTypes)).map((g) => g.slug);

describe("getGuidesForStore", () => {
  it("leads with the guide whose subject the shop actually offers", () => {
    // The regression this weighting exists for: a boot-fitting shop used to get
    // the waxing guide first, because waxing+repairs scored two weak matches
    // while boot-fitting scored one.
    expect(slugs(["rentals", "repairs", "boot-fitting", "waxing"])[0]).toBe(
      "boot-fitting-guide"
    );
  });

  it("prefers a distinctive service over a near-universal one", () => {
    // Almost every shop rents gear, so rentals must not outrank used-gear.
    const ranked = slugs(["rentals", "used-gear"]);
    expect(ranked.indexOf("renting-vs-buying-ski-equipment")).toBeLessThan(
      ranked.indexOf("how-to-choose-ski-rental-shop")
    );
  });

  it("still returns a full set when the shop matches nothing", () => {
    const result = getGuidesForStore(store([], []));
    expect(result).toHaveLength(3);
    expect(new Set(result.map((g) => g.slug)).size).toBe(3);
  });

  it("never repeats a guide when topping up from a partial match", () => {
    // One weak match means two slots come from the recency fallback — the
    // fallback must exclude what scoring already picked.
    const result = getGuidesForStore(store(["storage"], []));
    expect(new Set(result.map((g) => g.slug)).size).toBe(result.length);
  });

  it("respects the limit and never exceeds the catalogue", () => {
    expect(getGuidesForStore(store(["rentals"]), 1)).toHaveLength(1);
    expect(getGuidesForStore(store(["rentals"]), 99).length).toBeLessThanOrEqual(
      GUIDES.length
    );
  });

  it("is deterministic for the same input", () => {
    const a = slugs(["rentals", "waxing"]);
    const b = slugs(["rentals", "waxing"]);
    expect(a).toEqual(b);
  });

  it("declares every primaryTopic within its own topics", () => {
    // primaryTopic points at one of the topics rather than adding a new tag;
    // if they drift apart the multiplier silently stops applying.
    for (const guide of GUIDES) {
      if (guide.primaryTopic) {
        expect(guide.topics).toContain(guide.primaryTopic);
      }
    }
  });
});
