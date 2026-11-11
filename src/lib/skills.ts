// Pure helpers: self-reported vs demonstrated skills, and recommendations
// built only from in-app activities and the student's own feedback.
export type Competency = { id: string; title: string };
export type ScoredCriterion = { criterion_id: string; score: number; improvements?: string[] };
export type Attempt = { simulation_id: string; attempt_number: number; criteria: ScoredCriterion[] };

/** Average 1–5 score per competency, using only the latest completed attempt of each simulation. */
export function demonstratedScores(attempts: Attempt[], criterionToCompetency: Record<string, string | null>) {
  const latest = new Map<string, Attempt>();
  for (const a of attempts) {
    const cur = latest.get(a.simulation_id);
    if (!cur || a.attempt_number > cur.attempt_number) latest.set(a.simulation_id, a);
  }
  const sums = new Map<string, { total: number; n: number; improvements: string[] }>();
  for (const a of latest.values()) {
    for (const c of a.criteria) {
      const comp = criterionToCompetency[c.criterion_id];
      if (!comp) continue;
      const s = sums.get(comp) ?? { total: 0, n: 0, improvements: [] };
      s.total += c.score; s.n += 1; s.improvements.push(...(c.improvements ?? []));
      sums.set(comp, s);
    }
  }
  const out: Record<string, { score: number; improvements: string[] }> = {};
  for (const [k, v] of sums) out[k] = { score: Math.round((v.total / v.n) * 10) / 10, improvements: v.improvements };
  return out;
}

export type Recommendation = { competency_id: string; title: string; kind: "no-evidence" | "below-proficient" | "overrated"; message: string; actions: string[] };

export function recommend(
  competencies: Competency[],
  self: Record<string, number>,
  shown: Record<string, { score: number; improvements: string[] }>,
): Recommendation[] {
  const recs: (Recommendation & { p: number })[] = [];
  for (const c of competencies) {
    const d = shown[c.id];
    const s = self[c.id];
    if (!d) {
      recs.push({ competency_id: c.id, title: c.title, kind: "no-evidence", p: 1, message: `No demonstrated evidence yet for ${c.title}.`, actions: ["Complete a simulation that assesses this competency."] });
      continue;
    }
    if (d.score < 3.5) {
      recs.push({ competency_id: c.id, title: c.title, kind: "below-proficient", p: 4 - d.score + 2, message: `${c.title} is below proficient in your latest work (${d.score}/5).`, actions: d.improvements.slice(0, 3).length ? d.improvements.slice(0, 3) : ["Revise and resubmit your latest attempt."] });
    }
    if (s !== undefined && s - d.score >= 1.5) {
      recs.push({ competency_id: c.id, title: c.title, kind: "overrated", p: 1.5, message: `You rated ${c.title} ${s}/5, but your submitted work shows ${d.score}/5.`, actions: ["Review the feedback for this area before rating yourself again."] });
    }
  }
  return recs.sort((a, b) => b.p - a.p).map(({ p: _p, ...r }) => r);
}
