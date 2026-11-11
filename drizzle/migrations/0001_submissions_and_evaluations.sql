
ALTER TABLE public.submissions
  ADD COLUMN answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN evidence_url text;

-- Expected values for deterministic checks. Server-only: no grants to anon/authenticated.
CREATE TABLE public.answer_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  expected_numeric numeric,
  expected_text text,
  tolerance_pct numeric NOT NULL DEFAULT 0,
  tolerance_abs numeric NOT NULL DEFAULT 0,
  UNIQUE (simulation_id, metric_key)
);
GRANT ALL ON public.answer_keys TO service_role;
ALTER TABLE public.answer_keys ENABLE ROW LEVEL SECURITY;

-- Public metric definitions students fill in (labels only, no expected values).
CREATE TABLE public.simulation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  position int NOT NULL,
  label text NOT NULL,
  kind text NOT NULL DEFAULT 'number',
  hint text,
  UNIQUE (simulation_id, metric_key)
);
GRANT SELECT ON public.simulation_metrics TO anon, authenticated;
GRANT ALL ON public.simulation_metrics TO service_role;
ALTER TABLE public.simulation_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Metric definitions are public" ON public.simulation_metrics FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  overall_score numeric,
  summary text,
  criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.evaluations TO authenticated;
GRANT ALL ON public.evaluations TO service_role;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own evaluations readable" ON public.evaluations FOR SELECT TO authenticated USING (auth.uid() = user_id);

WITH s AS (SELECT id FROM public.simulations WHERE slug = 'retail-sales-performance')
INSERT INTO public.simulation_metrics (simulation_id, metric_key, position, label, kind, hint)
SELECT s.id, v.k, v.p, v.l, v.kind, v.h FROM s, (VALUES
  ('duplicate_rows', 1, 'Exact duplicate rows found', 'number', 'Count of rows that are exact copies of another row'),
  ('total_revenue', 2, 'Total revenue after cleaning (₦)', 'number', 'Quantity × unit price, summed over valid rows'),
  ('total_orders', 3, 'Total orders after cleaning', 'number', 'Number of distinct valid orders'),
  ('average_order_value', 4, 'Average order value (₦)', 'number', 'Total revenue ÷ total orders'),
  ('top_product', 5, 'Top product by revenue', 'text', 'Product name'),
  ('top_store', 6, 'Top store by revenue', 'text', 'Store name')
) AS v(k, p, l, kind, h);

WITH s AS (SELECT id FROM public.simulations WHERE slug = 'retail-sales-performance')
INSERT INTO public.answer_keys (simulation_id, metric_key, expected_numeric, expected_text, tolerance_pct, tolerance_abs)
SELECT s.id, v.k, v.n, v.t, v.pct, v.abs FROM s, (VALUES
  ('duplicate_rows', 42::numeric, NULL::text, 0::numeric, 2::numeric),
  ('total_revenue', 19936900, NULL, 3, 0),
  ('total_orders', 1412, NULL, 3, 0),
  ('average_order_value', 14119.62, NULL, 3, 0),
  ('top_product', NULL, 'oraimo earbuds', 0, 0),
  ('top_store', NULL, 'surulere', 0, 0)
) AS v(k, n, t, pct, abs);
