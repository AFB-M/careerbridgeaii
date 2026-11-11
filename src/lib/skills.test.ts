import { describe, expect, it } from "vitest";
import { demonstratedScores, recommend } from "./skills";

const map = { c1: "A", c2: "A", c3: "B" };
describe("demonstratedScores", () => {
  it("uses only the latest attempt per simulation", () => {
    const r = demonstratedScores([
      { simulation_id: "s", attempt_number: 1, criteria: [{ criterion_id: "c1", score: 1 }] },
      { simulation_id: "s", attempt_number: 2, criteria: [{ criterion_id: "c1", score: 4 }, { criterion_id: "c2", score: 5 }] },
    ], map);
    expect(r.A.score).toBe(4.5);
    expect(r.B).toBeUndefined();
  });
});
describe("recommend", () => {
  const comps = [{ id: "A", title: "Cleaning" }, { id: "B", title: "Viz" }];
  it("flags competencies with no evidence", () => {
    expect(recommend(comps, {}, { A: { score: 4, improvements: [] } }).map((r) => [r.competency_id, r.kind])).toEqual([["B", "no-evidence"]]);
  });
  it("flags below-proficient work with the student's own improvements", () => {
    const r = recommend([comps[0]], {}, { A: { score: 2, improvements: ["Remove duplicates first"] } });
    expect(r[0].kind).toBe("below-proficient");
    expect(r[0].actions).toEqual(["Remove duplicates first"]);
  });
  it("flags a self-rating 1.5+ above demonstrated", () => {
    expect(recommend([comps[0]], { A: 5 }, { A: { score: 3.5, improvements: [] } })[0].kind).toBe("overrated");
    expect(recommend([comps[0]], { A: 4 }, { A: { score: 3.5, improvements: [] } })).toEqual([]);
  });
});
