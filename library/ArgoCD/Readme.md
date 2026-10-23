# Argo CD library dashboard

Source: `ArgoCD Monitoring.dashboard.json` → starter slug `owl-argocd-argocd-monitoring`.

## Telemetry contract (Scale / Hetzner)

Configured in `seo-infra/helm-charts/owlpane-agent-hetzner` via `integrations.kubernetesScrapes` targeting the in-cluster Argo CD metrics endpoint.

| Metric | Role |
|--------|------|
| `argocd_app_info` | Gauge; filter by `health_status` (`Healthy`, `Degraded`, …) and `sync_status` (`Synced`, …) |
| `argocd_redis_request_total` | Counter; rate by `initiator` |
| `argocd_app_k8s_request_total` | Counter; rate by `resource_kind` |

Dogfood emit (local): `cd owlpane/sdk/examples && node scripts/emit-dashboard-library-metrics.mjs --category ArgoCD`

## Maintenance

```bash
node scripts/lint-library-dashboard-variables.mjs   # from owlpane-dashboards repo root
cd owlpane/api && npm run test:library-local
```

After JSON edits, regenerate starters in `owlpane-api` (`build-starter-dashboards.ts`).
