# Owlpane agent metric contract (library dashboards)

Dashboards in this folder target telemetry from the [Owlpane agent](https://github.com/OwlPane/owlpane-agent) (`k8s_cluster`, `kubeletstats`, `k8s_objects`, hostmetrics, optional Argo `kubernetesScrapes`).

## Use these names (not kube-state-metrics Prom streams)

| OpenObserve / import name | Owlpane OTel metric |
|---------------------------|---------------------|
| `k8s_pod_cpu_*` | `k8s.pod.cpu.time` |
| `k8s_pod_memory_*` | `k8s.pod.memory.usage` |
| `k8s_node_*` / `kube_node_info` | `k8s.node.*` (e.g. `k8s.node.allocatable_cpu`) |
| `k8s_deployment_available` | `k8s.deployment.available` |
| `k8s_hpa_desired_replicas` | `k8s.hpa.desired_replicas` |

## Labels

| Legacy | OTel resource attribute |
|--------|-------------------------|
| `k8s_cluster` | `k8s.cluster.name` |
| `k8s_namespace_name` | `k8s.namespace.name` |
| `k8s_node_name` | `k8s.node.name` |
| `k8s_pod_name` | `k8s.pod.name` |

Run `node scripts/normalize-owlpane-k8s-library.mjs` after editing JSON, then regenerate API starters:

```bash
cd owlpane/api
npx tsx scripts/build-starter-dashboards.ts ../owlpane-dashboards/library
```

**Clusters overview:** use `Owlpane/Kubernetes Clusters Overview.dashboard.json`. The legacy `kubernetes_overview.json` (kube-state + join SQL) is not imported.
