import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const careerPathQuery = (slug: string) =>
  queryOptions({
    queryKey: ["career-path", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_paths")
        .select("*, competencies(*)")
        .eq("slug", slug)
        .order("position", { referencedTable: "competencies" })
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const simulationsQuery = () =>
  queryOptions({
    queryKey: ["simulations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulations")
        .select("id, slug, title, role_title, organisation_name, business_problem, difficulty, estimated_minutes, career_paths(title)")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

export const simulationQuery = (slug: string) =>
  queryOptions({
    queryKey: ["simulation", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulations")
        .select("*, career_paths(title, slug), simulation_tasks(*), rubric_criteria(*, competencies(title))")
        .eq("slug", slug)
        .order("position", { referencedTable: "simulation_tasks" })
        .order("position", { referencedTable: "rubric_criteria" })
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} hr${h > 1 ? "s" : ""}${m ? ` ${m} min` : ""}` : `${m} min`;
}

export const simulationMetricsQuery = (simulationId: string) =>
  queryOptions({
    queryKey: ["simulation-metrics", simulationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("simulation_metrics").select("*").eq("simulation_id", simulationId).order("position");
      if (error) throw error;
      return data;
    },
  });

export type CriterionFeedback = {
  criterion_id: string; title: string; weight: number; score: number; rationale: string;
  strengths: string[]; weaknesses: string[]; improvements: string[]; evidence_quotes: string[];
};
export type MetricCheck = { metric_key: string; status: "correct" | "incorrect" | "missing"; submitted: string | null; note: string };

export const submissionQuery = (id: string) =>
  queryOptions({
    queryKey: ["submission", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*, simulations(id, slug, title, simulation_tasks(id, position, title), simulation_metrics(metric_key, label)), evaluations(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const attemptsQuery = (simulationId: string) =>
  queryOptions({
    queryKey: ["attempts", simulationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, attempt_number, submitted_at, status, evaluations(status, overall_score, criteria)")
        .eq("simulation_id", simulationId)
        .order("attempt_number");
      if (error) throw error;
      return data;
    },
  });
