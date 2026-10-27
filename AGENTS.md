# AGENTS.md — Owlpane Dashboard Library (`owlpane-dashboards`)

## Owlpane agent harness (Cursor, Claude Code, Trae, Codex, Copilot)

Portable rules for **low token use** and reliable edits. Keep this section short — it is always in context.

### Goal

Ship correct changes with **minimal tokens**: narrow reads, small diffs, no speculative work.

### Do these

1. **Scope first** — Name 1–3 files before broad search.
2. **Search before read** — Prefer ripgrep / path globs; never open lockfiles, `node_modules`, `dist`, Pods, or huge generated JSON whole.
3. **Progressive disclosure** — Open long `docs/**` only when the task needs them.
4. **Small diffs** — Fewest files. No drive-by refactors or unsolicited docs/tests.
5. **Reuse** — Match existing patterns; do not invent parallel helpers or frameworks.
6. **Verify cheaply** — Targeted tests over full-suite runs when possible.
7. **Secrets** — Never commit `.env`, keys, or `.clawness/`. Do not paste secrets into chat.
8. **Tenant safety** — Where this repo touches multi-tenant data: org-scope every query; never interpolate raw user strings into SQL.
9. **Customer copy** — Vendor-neutral UI/API/docs strings. No competitor product names in customer-facing copy.
10. **Stop early** — If blocked, say so in 2–3 lines; do not thrash tools.

### Anti-patterns (burn credits)

- Re-deriving architecture when README / this file already states it
- Heavy rebuilds (`pod install`, full Expo prebuild, Docker) unless required
- Parallel “explore everything” agents for a one-file fix
- Pasting huge tool outputs into the next prompt — summarize instead

### Tools

| Tool | How this file is used |
|------|------------------------|
| **Claude Code** | Loads `CLAUDE.md` (points here) |
| **Cursor / Trae / Codex / Copilot** | Honor this `AGENTS.md` as project instructions |
| **Owlpane MCP** | Curated tools only; do not dump full OpenAPI into context |

Owlpane remotes: day-to-day work on integration branch **`dev`** (merge to `main` when green).

### Done checklist

- [ ] Touched only what the task needed
- [ ] Ran the smallest relevant check
- [ ] No secrets / `.clawness` staged
- [ ] Listed anything intentionally left undone (if needed)

## This repository

Prebuilt tabbed-grid (192-column) dashboards for Owlpane console import/library.

- Sources under `library/`; sync/normalize via `scripts/`.
- Prefer normalize scripts over hand-editing huge JSON when possible.
- Attribution: `ATTRIBUTION.md`. Vendor-neutral titles/copy.
