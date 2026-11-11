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
