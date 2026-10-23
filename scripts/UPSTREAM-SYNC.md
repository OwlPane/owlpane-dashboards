# Upstream OpenObserve dashboards → Owlpane library

1. Sync or cherry-pick from [openobserve/dashboards](https://github.com/openobserve/dashboards) (Apache-2.0) into `library/`.
2. Vendor / brand pass: `node scripts/normalize-for-owlpane.mjs` (colors, zo_* → owlpane, URLs).
3. Agent metric pass: `node scripts/normalize-owlpane-k8s-library.mjs`
4. Variable pass: `node scripts/fix-owlpane-library-variables.mjs`
5. Lint: `node scripts/lint-library-dashboard-variables.mjs`
6. Codegen (owlpane-api repo):

```bash
cd owlpane/api
npx tsx scripts/build-starter-dashboards.ts ../owlpane-dashboards/library
npm run build:starter-catalog
npm run check:starter-catalog
node ../owlpane-dashboards/scripts/audit-o2-stream-parity.mjs
npm run test:library-local
```

## Folder drift to watch

| Upstream | Owlpane |
|----------|---------|
| `OpenObserve/` | `Owlpane/` |
| `Kubernetes(openobserve-collector)/` | `Kubernetes(owlpane-otel-collector)/` + `Owlpane/Kubernetes *.dashboard.json` |
| `kubernetes_overview.json` | Skipped — use `Owlpane/Kubernetes Clusters Overview.dashboard.json` |

Track skipped files in [SKIPPED-IMPORTS.md](../library/SKIPPED-IMPORTS.md).
