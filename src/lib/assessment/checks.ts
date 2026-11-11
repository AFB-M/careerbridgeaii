/** Deterministic checks of a student's reported metrics against the simulation's answer key. */
export type AnswerKey = {
  metric_key: string;
  expected_numeric: number | null;
  expected_text: string | null;
  tolerance_pct: number;
  tolerance_abs: number;
};

export type CheckResult = {
  metric_key: string;
  status: "correct" | "incorrect" | "missing";
  submitted: string | null;
  note: string;
};

export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[₦,\s]/g, "").replace(/ngn/i, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function normaliseText(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function checkMetrics(keys: AnswerKey[], submitted: Record<string, string>): CheckResult[] {
  return keys.map((k) => {
    const value = (submitted[k.metric_key] ?? "").trim();
    if (!value) return { metric_key: k.metric_key, status: "missing", submitted: null, note: "No value submitted." };
    if (k.expected_numeric !== null) {
      const n = parseNumber(value);
      if (n === null) return { metric_key: k.metric_key, status: "incorrect", submitted: value, note: "Not a valid number." };
      const expected = Number(k.expected_numeric);
      const allowed = Math.max(Math.abs(expected) * (Number(k.tolerance_pct) / 100), Number(k.tolerance_abs));
      const ok = Math.abs(n - expected) <= allowed;
      return {
        metric_key: k.metric_key,
        status: ok ? "correct" : "incorrect",
        submitted: value,
        note: ok ? "Within the accepted range of the reference value." : "Outside the accepted range — recheck your cleaning steps and calculation.",
      };
    }
    const ok = normaliseText(value).includes(normaliseText(k.expected_text ?? ""));
    return {
      metric_key: k.metric_key,
      status: ok ? "correct" : "incorrect",
      submitted: value,
      note: ok ? "Matches the reference answer." : "Does not match the reference answer for the cleaned data.",
    };
  });
}

/** Keeps only evidence quotes that literally appear in the student's own text. */
export function keepVerifiedQuotes(quotes: string[], corpus: string): string[] {
  const hay = corpus.toLowerCase().replace(/\s+/g, " ");
  return quotes.filter((q) => {
    const needle = q.toLowerCase().replace(/\s+/g, " ").trim();
    return needle.length >= 6 && hay.includes(needle);
  });
}

/** Weighted overall score on a 0–100 scale from 1–5 criterion scores. */
export function weightedScore(items: { score: number; weight: number }[]) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  if (!total) return 0;
  const sum = items.reduce((s, i) => s + (Math.min(5, Math.max(1, i.score)) / 5) * i.weight, 0);
  return Math.round((sum / total) * 100);
}
