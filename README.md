# Owlpane Dashboard Library

Prebuilt observability dashboards for **Owlpane** in the **tabbed-grid (192-column)** JSON format, ready for one-click install from the Owlpane console or JSON import.

Sources are refreshed with `scripts/sync-upstream.sh` and normalized by `scripts/normalize-for-owlpane.mjs`. See [ATTRIBUTION.md](./ATTRIBUTION.md) for Apache-2.0 source attribution.

## Layout

| Path | Purpose |
|------|---------|
| `library/` | Dashboard JSON and integration guides, grouped by integration (`Kafka`, `Kubernetes`, `AWS`, `Postgres`, …) |
| `scripts/sync-upstream.sh` | Refresh upstream community collection and apply Owlpane normalization |
| `scripts/normalize-for-owlpane.mjs` | Normalize titles, filenames, documentation copy, and palette (`#0f7a4f`) |

## Using in Owlpane

1. **Console → Dashboards → Library** — install pre-converted integration dashboards with one click.
2. **Console → Dashboards → Import** — paste or upload any `*.dashboard.json` from `library/` using the **Tabbed grid (192-col)** source option, or import a **Prometheus panel export**.
3. **Regenerating API starters** — pre-converted starters are compiled into `owlpane-api` via `scripts/build-starter-dashboards.ts`:

   ```bash
   cd ../api
   npx tsx scripts/build-starter-dashboards.ts ../owlpane-dashboards/library
   git add src/product/starter-dashboards.generated.ts && git commit -m "chore: refresh starter dashboards"
   ```

## Features

- **192-column tabbed grid** — Non-overlapping GridStack layout (`float: false`) designed for wall displays and incident rooms.
- **Template variables** — `$service`, `$env`, and label-driven dropdown variables with cascading filters.
- **One-click library install** — Install directly from **Dashboards → Library** into any Owlpane workspace.
- **Idempotent JSON import** — Re-importing an updated file updates existing dashboards cleanly without duplicating unmodified widgets.

## Contributing

Add or edit JSON under `library/<Integration>/`, run `node scripts/normalize-for-owlpane.mjs`, open a pull request, and regenerate `starter-dashboards.generated.ts` in `owlpane-api`.
