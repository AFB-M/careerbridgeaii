import { describe, expect, it } from "vitest";
import { checkMetrics, keepVerifiedQuotes, parseNumber, weightedScore, type AnswerKey } from "./checks";

const keys: AnswerKey[] = [
  { metric_key: "total_revenue", expected_numeric: 19936900, expected_text: null, tolerance_pct: 3, tolerance_abs: 0 },
  { metric_key: "duplicate_rows", expected_numeric: 42, expected_text: null, tolerance_pct: 0, tolerance_abs: 2 },
  { metric_key: "top_store", expected_numeric: null, expected_text: "surulere", tolerance_pct: 0, tolerance_abs: 0 },
];

describe("deterministic metric checks", () => {
  it("accepts revenue within 3% and naira formatting", () => {
    expect(checkMetrics(keys, { total_revenue: "₦20,400,000" })[0]!.status).toBe("correct");
  });
  it("rejects revenue more than 3% off", () => {
    expect(checkMetrics(keys, { total_revenue: "21000000" })[0]!.status).toBe("incorrect");
  });
  it("allows duplicate count within 2 rows", () => {
    expect(checkMetrics(keys, { duplicate_rows: "44" })[1]!.status).toBe("correct");
    expect(checkMetrics(keys, { duplicate_rows: "45" })[1]!.status).toBe("incorrect");
  });
  it("matches text answers case-insensitively and flags missing ones", () => {
    const r = checkMetrics(keys, { top_store: "SURULERE store" });
    expect(r[2]!.status).toBe("correct");
    expect(r[0]!.status).toBe("missing");
  });
  it("parses numbers", () => expect(parseNumber("₦ 14,119.62")).toBe(14119.62));
});

describe("evidence and scoring", () => {
  it("drops quotes not present in the submission", () => {
    expect(keepVerifiedQuotes(["removed 42 duplicate rows", "I built a regression"], "I removed 42  duplicate rows first.")).toEqual(["removed 42 duplicate rows"]);
  });
  it("weights 1–5 scores to 0–100", () => {
    expect(weightedScore([{ score: 5, weight: 25 }, { score: 1, weight: 75 }])).toBe(40);
  });
});
