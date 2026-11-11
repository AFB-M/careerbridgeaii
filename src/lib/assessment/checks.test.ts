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

describe("Retail Sales answer-key rules", () => {
  const keys: AnswerKey[] = [
    { metric_key: "total_revenue", expected_numeric: 19936900, expected_text: null, tolerance_pct: 0.5, tolerance_abs: 0 },
    { metric_key: "total_orders", expected_numeric: 1412, expected_text: null, tolerance_pct: 0, tolerance_abs: 0 },
  ];
  const status = (m: Record<string, string>) => checkMetrics(keys, m).map((c) => c.status);
  it("accepts the documented cleaned figures", () => {
    expect(status({ total_revenue: "₦19,936,900", total_orders: "1412" })).toEqual(["correct", "correct"]);
  });
  it("rejects figures that keep the 42 duplicate rows", () => {
    expect(status({ total_revenue: "20530000", total_orders: "1454" })).toEqual(["incorrect", "incorrect"]);
  });
  it("five 20% criteria all at 3/5 give 60", () => {
    expect(weightedScore(Array.from({ length: 5 }, () => ({ score: 3, weight: 20 })))).toBe(60);
  });
});
