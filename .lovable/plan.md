# CareerBridge AI — Product & Architecture Plan

From academic knowledge to demonstrable workplace competence. Hackathon: Wale Lab NextGen AI 2026, Track 2. Launch pathway: Entry-Level Data Analyst (Nigeria).

## 1. Product requirements (summary)
Students practise realistic workplace simulations, submit work, get rubric-based formative AI feedback, revise, and turn finished work into portfolio evidence. Feedback is clearly labelled "formative AI feedback — not a verified certification".

## 2. Functional requirements
- Email/password + Google sign-in; career profile (university, course, graduation year, location, target career, self-reported skills).
- Baseline assessment: 12–15 multiple-choice/short items across the 5 Data Analyst competencies, auto-scored deterministically.
- Simulation catalogue with filters (difficulty, duration, skill).
- Simulation detail: scenario brief, tasks, rubric shown upfront, downloadable CSV dataset.
- Structured submission form: one answer field per task, key metric fields (e.g. total revenue, top product, duplicate rows found), optional file upload (CSV/XLSX/PDF/PNG, stored only, never executed), link field (notebook/dashboard).
- Deterministic checks: numeric answers compared to a stored answer key with tolerance.
- AI evaluation: per-criterion score (1–5), evidence quotes taken from the submission, strengths, weaknesses, improvements, next learning activities.
- Revisions: resubmit; attempts history with score deltas chart.
- Portfolio: convert a completed attempt into an entry; public shareable page (opt-in) distinguishing demonstrated vs self-reported skills.
- Recommendations: next learning activities drawn only from a curated catalogue stored in the database (no invented courses or jobs).
- Dashboard: readiness score, competency radar, recent feedback, next step.

## 3. Non-functional requirements
Responsive (360px+), WCAG AA contrast and keyboard navigation, AI feedback in under ~30s with loading state, all AI calls server-side, private data isolated per user.

## 4. Personas
- Amaka, final-year Economics student, UNILAG — knows Excel, no work experience.
- Tunde, recent Computer Science graduate, Ibadan — job hunting, needs proof of skill.
- Zainab, bank teller switching careers — evenings only, mobile-first.

## 5. User journey
```text
Landing -> Sign up -> Profile + target career -> Baseline assessment
 -> Dashboard -> Simulations -> Brief + dataset -> Submit
 -> Checks + AI feedback -> Revise/resubmit -> Progress view
 -> Add to portfolio -> Recommendations
```

## 6. Screens
Public: Landing, Sign in/up, Public portfolio (/p/:handle).
Signed-in: Onboarding (profile, career pick), Baseline assessment, Dashboard, Simulations list, Simulation detail, Submission workspace, Feedback report (scores, radar, evidence, improvements), Attempt history, Portfolio manager, Recommendations, Settings.

## 7. Database schema
- profiles (user id, name, university, course, grad year, location, target career, handle, portfolio public flag)
- self_reported_skills (user, skill, level)
- career_paths, competencies (per path, 5 for Data Analyst)
- assessment_questions, assessment_attempts, assessment_answers
- simulations (path, title, scenario, difficulty, duration), simulation_tasks, rubric_criteria (competency, weight, level descriptors), answer_keys (expected values, tolerance — server-only), datasets (storage path)
- submissions (user, simulation, attempt number, status), submission_answers, submission_files
- evaluations (submission, overall score, deterministic results, model, disclaimer version), criterion_scores (criterion, score, evidence quotes, strengths, weaknesses, improvements)
- portfolio_entries (user, submission, title, summary, visibility)
- learning_resources (curated, tagged by competency), recommendations (user, resource, reason)
- user_roles (admin for content management)

Relationships: path -> competencies -> rubric criteria; simulation -> tasks/criteria/dataset; user -> submissions -> evaluation -> criterion scores -> portfolio entry.

## 8. AI assessment architecture
```text
Submit -> server function
  1. Validate input, load rubric + answer key (server-only)
  2. Deterministic checks on numeric answers
  3. AI call with tool-calling JSON schema: rubric + task text + student
     answers + check results; instructed to quote only submitted text
  4. Validate output: scores in range, every evidence quote must exist
     in the submission (else dropped), recommendations must match
     curated resource IDs
  5. Save evaluation; show report
```
Uploaded files are stored, not parsed or executed; only text answers and metric fields are evaluated.

## 9. Simulation content structure
First simulation "Retail Sales Performance Analysis": fictional Lagos retailer, ~1,500-row sales CSV with seeded issues (duplicates, missing values, inconsistent dates/product names, negative quantities). 7 tasks matching the brief, 5 weighted rubric criteria with 4 level descriptors each, answer key for core metrics.

## 10. Security & privacy
Row-level access: users read/write only their own profile, submissions, evaluations, portfolio. Public portfolio entries readable only when opted in. Answer keys and rubric internals unreadable by students. AI key server-side only. File type/size limits on uploads, private storage bucket.

## 11. Phased roadmap
1. Foundation: design system, landing page, Cloud, auth, onboarding/profile.
2. Content: career path, competencies, simulation, tasks, rubric, dataset, catalogue + detail screens.
3. Submission + deterministic checks + AI evaluation + feedback report.
4. Revisions, history, progress charts, dashboard.
5. Baseline assessment, portfolio (private + public), recommendations.
6. Polish: mobile, accessibility, empty states, demo account, publish.

## 12. MVP acceptance criteria
- A new user can sign up, complete profile, take baseline, and see a dashboard.
- User can download the dataset, submit answers, and receive per-criterion feedback with evidence quoted from their own submission.
- Wrong numeric answers are flagged by deterministic checks.
- Resubmission shows score change per criterion.
- Completed attempt becomes a portfolio entry; public page shows demonstrated vs self-reported skills.
- A second user cannot see the first user's submissions or feedback.
- Disclaimer appears on every feedback and portfolio view.

## Technical notes
TanStack Start + Lovable Cloud (database, auth, storage), server functions for evaluation, Lovable AI (Gemini Flash default) with structured tool output, Recharts for radar/progress. GitHub is connected by you from the project's GitHub settings.
