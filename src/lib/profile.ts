import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const myProfileQuery = () =>
  queryOptions({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*, career_paths(id, slug, title)")
        .eq("id", u.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const careerPathsQuery = () =>
  queryOptions({
    queryKey: ["career-paths"],
    queryFn: async () => {
      const { data, error } = await supabase.from("career_paths").select("id, slug, title").order("title");
      if (error) throw error;
      return data;
    },
  });
