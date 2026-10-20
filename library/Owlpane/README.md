# Owlpane platform dashboards

Charts for **ingestion, agent, and SDK** telemetry in a tenant workspace (not OpenObserve `zo_*` internals).

- **Platform Infrastructure** — CPU, memory, storage, network (Kubernetes-scoped variables).
- **Platform Internals** — ingest throughput, HTTP/gRPC-style latency panels (expects [dashboard-metrics-catalog.md](../../../api/docs/observability/dashboard-metrics-catalog.md) metric names).

![Owlpane Infrastructure](./screenshots/infrastructure.png)

![Owlpane Internals](./screenshots/internals.png)

**Dogfood:** `sdk/examples/scripts/emit-dashboard-library-metrics.mjs`  
**Operators (cell ClickHouse):** [CHouse UI](https://github.com/daun-gatal/chouse-ui) — see `stumpcam/deploy/docs/chouse-ui-local.md`


