# Metrics contract — library vs agent vs OpenObserve streams

| Layer | OpenObserve habit | Owlpane production |
|--------|-------------------|---------------------|
| Series identity | `fields.stream` per panel (e.g. `k8s_pod_cpu_usage`) | **`MetricName`** in telemetry lake (`k8s.pod.cpu.time`) |
| K8s pack folder | `Kubernetes(openobserve-collector)` | `Kubernetes(owlpane-otel-collector)` + **`Owlpane/`** tier |
| Events | `k8s_events` logs stream | Virtual SQL table over `ServiceName = 'kubernetes-cluster'` |
| Variables | Dotted names (`k8s.namespace.name`) | Import-safe **`k8s_cluster`**, **`k8s_namespace`**, … |

## Tier 1 — Owlpane agent (Scale default)

Emitters: **owlpane-agent** (k8s_cluster, kubeletstats, k8s_objects, hostmetrics), **kubernetesScrapes** (Argo `argocd_*`), **owlpane-ingest** (`owlpane_ingest_*`), **API/SDK** OTLP.

CI enforcement: [`owlpane-api` `metrics-contract-tier1.ts`](../../api/src/product/metrics-contract-tier1.ts) + `npm run check:starter-catalog`.

## Tier 2 — Agent integrations (opt-in)

When `integrations.postgres`, `integrations.redis`, … are enabled in agent Helm, contrib receiver **MetricName** values must match integration library folders (Redis, PostgreSQL, …).

## Tier 3 — External exporters

kube-prometheus, ScyllaDB, Snowflake, etc. — library JSON may reference streams your tenant does not have; starters are labeled **Advanced** at codegen.

## Variable contract

See [OWLPANE-METRICS.md](./Kubernetes(owlpane-otel-collector)/OWLPANE-METRICS.md). Run `node scripts/fix-owlpane-library-variables.mjs` after JSON edits.

## Parity audit

O2 stream parity was enforced by `scripts/audit-o2-stream-parity.mjs` (removed 2026-11); use Tier-1 contract tests in `owlpane-api` (`npm run check:starter-catalog`) and variable lint in this repo (`node scripts/lint-library-dashboard-variables.mjs`).
