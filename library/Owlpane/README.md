# Owlpane platform dashboards

Charts for **ingestion, agent, and SDK** telemetry in a tenant workspace (not OpenObserve `zo_*` internals).

## Platform (lane A)

- **Platform Infrastructure** — CPU, memory, storage, network (Kubernetes-scoped variables).
- **Platform Internals** — ingest throughput, HTTP/gRPC-style latency panels (expects [dashboard-metrics-catalog.md](../../../api/docs/observability/dashboard-metrics-catalog.md) metric names).

![Owlpane Infrastructure](./screenshots/infrastructure.png)

![Owlpane Internals](./screenshots/internals.png)

## Kubernetes (Owlpane agent — Tier A)

First-class starters backed by the **owlpane-agent** OTel receivers (not kube-prometheus recording rules):

| Dashboard | Variables | Notes |
|-----------|-----------|--------|
| **Kubernetes Clusters Overview** | `k8s_cluster` | Nodes, deployments, kubernetes-cluster events |
| **Kubernetes Namespace Pods (Owlpane)** | `k8s_cluster`, `k8s_namespace` | Pod CPU, memory, network |
| **Kubernetes Namespace Workloads (Owlpane)** | `k8s_cluster` | Deployments / StatefulSets from k8s_cluster receiver |
| **Kubernetes Cluster Resources (Owlpane)** | `k8s_cluster` | Node allocatable CPU/memory |
| **Kubernetes API Server (Owlpane)** | — | Markdown scope only — apiserver metrics need Tier B scrape |

Community **Kubernetes (Owlpane agent)** pack lives under `library/Kubernetes(owlpane-otel-collector)/` (same metric contract).

**Advanced:** `library/Kubernetes(kube-prometheus-stack)/` — empty on agent-only clusters; see that folder README.

Metric naming: [METRICS-CONTRACT.md](../METRICS-CONTRACT.md) · Tier-1 QA: [metrics-contract-tier1.md](../../../api/docs/ops/metrics-contract-tier1.md)

**Dogfood:** `sdk/examples/scripts/emit-dashboard-library-metrics.mjs --from-catalog --tier1`  
**Scale QA:** [scale-org-dashboard-library-qa.md](../../../api/docs/ops/scale-org-dashboard-library-qa.md)  
**Operators (cell ClickHouse):** [CHouse UI](https://github.com/daun-gatal/chouse-ui) — see `stumpcam/deploy/docs/chouse-ui-local.md`
