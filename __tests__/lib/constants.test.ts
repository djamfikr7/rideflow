import { describe, it, expect } from "vitest";
import { RIDE_TYPES, BASE_FARE, PER_KM_RATE, PER_MINUTE_RATE } from "../../lib/constants";

describe("RIDE_TYPES", () => {
  it("has exactly 3 entries", () => {
    expect(RIDE_TYPES).toHaveLength(3);
  });

  it("contains standard, comfort, and premium", () => {
    const ids = RIDE_TYPES.map((r) => r.id);
    expect(ids).toContain("standard");
    expect(ids).toContain("comfort");
    expect(ids).toContain("premium");
  });

  it("each type has required fields", () => {
    for (const rideType of RIDE_TYPES) {
      expect(rideType).toHaveProperty("id");
      expect(rideType).toHaveProperty("name");
      expect(rideType).toHaveProperty("multiplier");
      expect(rideType).toHaveProperty("icon");
    }
  });

  it("standard has multiplier 1.0", () => {
    const standard = RIDE_TYPES.find((r) => r.id === "standard")!;
    expect(standard.multiplier).toBe(1.0);
    expect(standard.name).toBe("Standard");
  });

  it("comfort has multiplier 1.5", () => {
    const comfort = RIDE_TYPES.find((r) => r.id === "comfort")!;
    expect(comfort.multiplier).toBe(1.5);
    expect(comfort.name).toBe("Comfort");
  });

  it("premium has multiplier 2.0", () => {
    const premium = RIDE_TYPES.find((r) => r.id === "premium")!;
    expect(premium.multiplier).toBe(2.0);
    expect(premium.name).toBe("Premium");
  });

  it("multipliers are in ascending order", () => {
    const multipliers = RIDE_TYPES.map((r) => r.multiplier);
    expect(multipliers[0]).toBeLessThan(multipliers[1]);
    expect(multipliers[1]).toBeLessThan(multipliers[2]);
  });
});

describe("Pricing constants", () => {
  it("BASE_FARE is a positive number", () => {
    expect(BASE_FARE).toBeGreaterThan(0);
    expect(typeof BASE_FARE).toBe("number");
  });

  it("PER_KM_RATE is a positive number", () => {
    expect(PER_KM_RATE).toBeGreaterThan(0);
    expect(typeof PER_KM_RATE).toBe("number");
  });

  it("PER_MINUTE_RATE is a positive number", () => {
    expect(PER_MINUTE_RATE).toBeGreaterThan(0);
    expect(typeof PER_MINUTE_RATE).toBe("number");
  });

  it("BASE_FARE is 2.5", () => {
    expect(BASE_FARE).toBe(2.5);
  });

  it("PER_KM_RATE is 1.5", () => {
    expect(PER_KM_RATE).toBe(1.5);
  });

  it("PER_MINUTE_RATE is 0.2", () => {
    expect(PER_MINUTE_RATE).toBe(0.2);
  });
});
