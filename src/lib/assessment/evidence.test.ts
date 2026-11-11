import { describe, expect, it } from "vitest";
import { MAX_CHART_BYTES, validateChart } from "./evidence";

describe("inspectable chart evidence", () => {
  it("accepts PNG evidence", () => expect(validateChart(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))).toBe("image/png"));
  it("accepts JPEG evidence", () => expect(validateChart(new Uint8Array([255, 216, 255]))).toBe("image/jpeg"));
  it("accepts WebP evidence", () => expect(validateChart(new TextEncoder().encode("RIFF0000WEBP"))).toBe("image/webp"));
  it("rejects non-image evidence", () => expect(() => validateChart(new TextEncoder().encode("a,b\n1,2"))).toThrow("PNG, JPEG or WebP"));
  it("rejects missing evidence", () => expect(() => validateChart(new Uint8Array())).toThrow("non-empty"));
  it("enforces the 10 MB limit", () => {
    expect(MAX_CHART_BYTES).toBe(10485760);
    expect(() => validateChart(new Uint8Array(10485761))).toThrow("10 MB");
  });
});