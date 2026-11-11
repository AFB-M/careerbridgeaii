import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const mySelfRatingsQuery = () =>
  queryOptions({
    queryKey: ["self-ratings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skill_self_ratings").select("competency_id, rating, note, updated_at");
      if (error) throw error;
      return data;
    },
  });

export const myEvidenceQuery = () =>
  queryOptions({
    queryKey: ["my-evidence"],
    queryFn: async () => {
      const [subs, crit] = await Promise.all([
        supabase.from("submissions").select("simulation_id, attempt_number, evaluations(status, criteria)").eq("status", "evaluated"),
        supabase.from("rubric_criteria").select("id, competency_id"),
      ]);
      if (subs.error) throw subs.error;
      if (crit.error) throw crit.error;
      return { submissions: subs.data, criterionToCompetency: Object.fromEntries(crit.data.map((c) => [c.id, c.competency_id])) };
    },
  });

export const myPortfolioQuery = () =>
  queryOptions({
    queryKey: ["my-portfolio"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("portfolio_entries").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
