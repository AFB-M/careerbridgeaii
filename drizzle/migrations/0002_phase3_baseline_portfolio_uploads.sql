CREATE TABLE public.skill_self_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  competency_id uuid NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  note text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, competency_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_self_ratings TO authenticated;
GRANT ALL ON public.skill_self_ratings TO service_role;
ALTER TABLE public.skill_self_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own ratings" ON public.skill_self_ratings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.portfolio_entries
  ADD COLUMN is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN overall_score numeric,
  ADD COLUMN simulation_title text,
  ADD COLUMN owner_name text,
  ADD COLUMN competency_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN highlights jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS portfolio_entries_submission_uniq ON public.portfolio_entries(submission_id);
DROP POLICY "Own portfolio" ON public.portfolio_entries;
REVOKE INSERT, UPDATE ON public.portfolio_entries FROM authenticated;
GRANT SELECT ON public.portfolio_entries TO anon;
CREATE POLICY "Own portfolio read" ON public.portfolio_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own portfolio delete" ON public.portfolio_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public portfolio read" ON public.portfolio_entries FOR SELECT TO anon, authenticated USING (is_public);

ALTER TABLE public.submissions ADD COLUMN evidence_file_path text;

CREATE POLICY "Evidence own upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Evidence own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Evidence own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);