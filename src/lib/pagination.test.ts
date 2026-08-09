import { describe, expect, it } from "vitest";
import { pageCount, pageSlice, pageStart, parsePageParam } from "./pagination";

describe("parsePageParam", () => {
  it("accepts plain page numbers", () => {
    expect(parsePageParam("2")).toBe(2);
    expect(parsePageParam("17")).toBe(17);
  });

  it("rejects anything that would make one page reachable by several URLs", () => {
    for (const raw of ["01", "1.0", "2.5", "-1", "0", "", " 2", "2 ", "1e2", "٢", "two"]) {
      expect(parsePageParam(raw), `expected ${JSON.stringify(raw)} to be rejected`).toBeNull();
    }
  });

  it("rejects values too large to be a safe integer", () => {
    expect(parsePageParam("9".repeat(25))).toBeNull();
  });
});

describe("pageCount", () => {
  it("counts pages for an exact and a partial final page", () => {
    expect(pageCount(96, 48)).toBe(2);
    expect(pageCount(97, 48)).toBe(3);
    expect(pageCount(327, 48)).toBe(7); // the US, which motivated pagination
  });

  it("always reports at least one page", () => {
    expect(pageCount(0, 48)).toBe(1);
    expect(pageCount(-5, 48)).toBe(1);
    expect(pageCount(10, 0)).toBe(1);
    expect(pageCount(NaN, 48)).toBe(1);
  });
});

describe("pageSlice", () => {
  const items = Array.from({ length: 100 }, (_, i) => i);

  it("returns consecutive, non-overlapping windows", () => {
    expect(pageSlice(items, 1, 48)[0]).toBe(0);
    expect(pageSlice(items, 2, 48)[0]).toBe(48);
    expect(pageSlice(items, 1, 48)).toHaveLength(48);
  });

  it("returns the remainder on the final page", () => {
    expect(pageSlice(items, 3, 48)).toHaveLength(4);
  });

  it("covers every item exactly once across all pages", () => {
    const total = pageCount(items.length, 48);
    const seen = Array.from({ length: total }, (_, i) => pageSlice(items, i + 1, 48)).flat();
    expect(seen).toEqual(items);
  });

  it("returns nothing past the end rather than wrapping", () => {
    expect(pageSlice(items, 99, 48)).toEqual([]);
  });
});

describe("pageStart", () => {
  it("is zero-based and never negative", () => {
    expect(pageStart(1, 48)).toBe(0);
    expect(pageStart(3, 48)).toBe(96);
    expect(pageStart(0, 48)).toBe(0);
  });
});
