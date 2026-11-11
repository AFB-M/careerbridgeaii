
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.career_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.career_paths TO anon, authenticated;
GRANT ALL ON public.career_paths TO service_role;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Career paths are public" ON public.career_paths FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id uuid NOT NULL REFERENCES public.career_paths(id) ON DELETE CASCADE,
  position int NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  indicators text[] NOT NULL DEFAULT '{}'
);
GRANT SELECT ON public.competencies TO anon, authenticated;
GRANT ALL ON public.competencies TO service_role;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Competencies are public" ON public.competencies FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  institution text,
  course_of_study text,
  graduation_year int,
  location text,
  target_career_path_id uuid REFERENCES public.career_paths(id),
  onboarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id uuid NOT NULL REFERENCES public.career_paths(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  role_title text NOT NULL,
  organisation_name text NOT NULL,
  organisation_background text NOT NULL,
  business_problem text NOT NULL,
  responsibilities text[] NOT NULL DEFAULT '{}',
  deliverables text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL,
  estimated_minutes int NOT NULL,
  dataset_filename text,
  dataset_description text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.simulations TO anon, authenticated;
GRANT ALL ON public.simulations TO service_role;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published simulations are public" ON public.simulations FOR SELECT TO anon, authenticated USING (is_published);

CREATE TABLE public.simulation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  position int NOT NULL,
  title text NOT NULL,
  instructions text NOT NULL
);
GRANT SELECT ON public.simulation_tasks TO anon, authenticated;
GRANT ALL ON public.simulation_tasks TO service_role;
ALTER TABLE public.simulation_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks are public" ON public.simulation_tasks FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.rubric_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  competency_id uuid REFERENCES public.competencies(id),
  position int NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  weight int NOT NULL
);
GRANT SELECT ON public.rubric_criteria TO anon, authenticated;
GRANT ALL ON public.rubric_criteria TO service_role;
ALTER TABLE public.rubric_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rubric is public" ON public.rubric_criteria FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  simulation_id uuid NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  attempt_number int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own submissions" ON public.submissions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER submissions_updated BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.portfolio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  submission_id uuid REFERENCES public.submissions(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_entries TO authenticated;
GRANT ALL ON public.portfolio_entries TO service_role;
ALTER TABLE public.portfolio_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own portfolio" ON public.portfolio_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed content
WITH cp AS (
  INSERT INTO public.career_paths (slug, title, summary, description) VALUES (
    'data-analyst', 'Entry-Level Data Analyst',
    'Turn raw business data into clear, defensible decisions.',
    'Entry-level data analysts in Nigerian banks, retailers, fintechs and FMCG firms clean messy operational data, calculate business indicators, spot trends and explain what the numbers mean for managers. This pathway lets you practise and evidence those abilities through realistic workplace simulations.'
  ) RETURNING id
), comps AS (
  INSERT INTO public.competencies (career_path_id, position, title, description, indicators)
  SELECT cp.id, v.pos, v.title, v.descr, v.ind FROM cp, (VALUES
    (1, 'Data cleaning and preparation', 'Inspect raw data, identify quality issues and prepare a reliable analysis-ready dataset.', ARRAY['Detects duplicates, missing and invalid values','Standardises inconsistent formats','Documents every cleaning decision']),
    (2, 'Data analysis and statistical reasoning', 'Choose appropriate methods and calculate accurate business indicators.', ARRAY['Calculates revenue, volume and average order value correctly','Uses appropriate aggregations and comparisons','Checks results for reasonableness']),
    (3, 'Data interpretation and insight generation', 'Explain what the results mean for the business, not only what they are.', ARRAY['Identifies meaningful trends and anomalies','Links findings to business context','Separates evidence from assumption']),
    (4, 'Data visualisation', 'Present findings in charts and tables that are accurate and easy to read.', ARRAY['Chooses suitable chart types','Labels axes, units and sources','Avoids misleading scales']),
    (5, 'Business communication and recommendations', 'Communicate findings and practical recommendations to non-technical managers.', ARRAY['Writes a concise executive summary','Makes specific, actionable recommendations','States limitations clearly'])
  ) AS v(pos, title, descr, ind) RETURNING id, position
), sim AS (
  INSERT INTO public.simulations (career_path_id, slug, title, role_title, organisation_name, organisation_background, business_problem, responsibilities, deliverables, difficulty, estimated_minutes, dataset_filename, dataset_description)
  SELECT cp.id, 'retail-sales-performance', 'Retail Sales Performance Analysis', 'Junior Data Analyst', 'Ọjà Mart Retail Ltd',
    'Ọjà Mart is a fictional mid-sized retail chain headquartered in Ikeja, Lagos, with stores in Ikeja, Lekki, Surulere and Yaba. It sells groceries, household essentials, personal care and small electronics, and recently started accepting orders through a partner delivery app.',
    'Revenue growth has slowed over the past year and the Head of Commercial cannot tell which stores, products and channels are driving or dragging performance. The transaction export from the point-of-sale system is messy, and previous reports contradicted each other. Management wants a reliable analysis of revenue trends, product performance and concrete opportunities for the next quarter.',
    ARRAY['Inspect and clean the sales export before any analysis','Calculate the core business indicators management relies on','Identify trends across months, stores, categories and channels','Translate findings into practical recommendations for the commercial team'],
    ARRAY['A short data quality log listing each issue found and how you resolved it','Key metrics: total revenue, number of orders, average order value, top products and categories','A summary of monthly and store-level trends','Three to five evidence-based recommendations for management','Optional: a link to your spreadsheet, notebook or dashboard'],
    'Beginner–Intermediate', 180, 'oja-mart-sales-2025.csv',
    'Point-of-sale export of sales transactions for January–December 2025 across four Lagos stores and the delivery-app channel. Contains deliberate real-world data quality issues.'
  FROM cp RETURNING id
), tasks AS (
  INSERT INTO public.simulation_tasks (simulation_id, position, title, instructions)
  SELECT sim.id, v.pos, v.title, v.ins FROM sim, (VALUES
    (1, 'Inspect the dataset', 'Open the file and describe its structure: number of rows and columns, what each field represents, and the date range covered.'),
    (2, 'Identify data quality issues', 'List every quality problem you find (for example duplicates, missing values, inconsistent spellings, invalid quantities or prices, mixed date formats) with an estimate of how many rows are affected.'),
    (3, 'Clean and prepare the data', 'Resolve each issue and explain the decision you made, including any rows you removed and why.'),
    (4, 'Calculate business indicators', 'Using your cleaned data, calculate total revenue, total orders, average order value and revenue by store, category and channel.'),
    (5, 'Identify sales trends', 'Describe how revenue changes month by month and highlight any seasonal patterns or unusual periods.'),
    (6, 'Analyse product performance', 'Identify the top and bottom performing products and categories by revenue and by units sold.'),
    (7, 'Develop actionable recommendations', 'Write three to five specific recommendations for the Head of Commercial, each linked to evidence from your analysis.')
  ) AS v(pos, title, ins) RETURNING id
)
INSERT INTO public.rubric_criteria (simulation_id, competency_id, position, title, description, weight)
SELECT sim.id, comps.id, v.pos, v.title, v.descr, v.weight FROM sim, comps, (VALUES
  (1, 'Data cleaning and preparation', 'Finds the main quality issues, resolves them sensibly and documents each decision.', 25),
  (2, 'Analytical methodology', 'Chooses appropriate calculations and comparisons and applies them consistently.', 20),
  (3, 'Technical implementation', 'Produces accurate indicator values that match the cleaned data.', 20),
  (4, 'Interpretation and insights', 'Explains what the numbers mean for Ọjà Mart and identifies meaningful trends.', 20),
  (5, 'Communication and recommendations', 'Presents clear, specific, evidence-based recommendations for a non-technical manager.', 15)
) AS v(pos, title, descr, weight)
WHERE comps.position = CASE v.pos WHEN 1 THEN 1 WHEN 2 THEN 2 WHEN 3 THEN 2 WHEN 4 THEN 3 ELSE 5 END;
