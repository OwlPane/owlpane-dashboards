# Library JSON not exported as starters

`scripts/build-starter-dashboards.ts` walks all `*.json` under `library/`. **70** dashboards are committed in `owlpane-api` as `STARTER_DASHBOARDS`; **3** files produce no import body today:

| File | Reason |
|------|--------|
| `Kubernetes(kube-prometheus-stack)/Kubernetes _ Compute Resources _ Namespace (Workloads).dashboard.json` | Importer returns no body (kube-prometheus workload panels not translated) |
| `Traces/Traces - By service.dashboard.json` | Trace-native dashboard; use **Observability → Traces** instead |
| `Traces/Traces - Overall.dashboard.json` | Same |

Re-run locally:

```bash
cd owlpane/api
npx tsx scripts/build-starter-dashboards.ts ../owlpane-dashboards/library
```

Console output: `70 starter dashboards from 73 files (3 with nothing to keep)`.
