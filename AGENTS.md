<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## CareerBridge AI
- Simulation content (paths, competencies, simulations, tasks, rubric) is seeded via migrations and publicly readable; user data tables are owner-only via RLS — keeps briefs shareable and student work private.
- Practice datasets are static files in public/datasets/ — they are non-sensitive and must be freely downloadable.
- Public content pages use PageFrame (app nav when signed in, marketing header otherwise); signed-in-only pages live under src/routes/_authenticated/.
- Assessment: answer_keys are service-role only; evaluations are written only by the server (admin client after verifying ownership) and are read-only to their owner — students cannot see reference values or forge feedback.
- AI feedback runs server-side in src/lib/assessment (Responses API, structured output); deterministic checks in checks.ts are authoritative, and AI evidence quotes are dropped unless they appear verbatim in the submission.
