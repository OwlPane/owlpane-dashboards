# Kubernetes (kube-prometheus / advanced)

Dashboards in this folder expect **kube-prometheus**, **cAdvisor**, and **apiserver** recording rules — **not** the default [Owlpane agent](https://github.com/OwlPane/owlpane-agent) alone.

On agent-only clusters (e.g. Scale Hetzner with owlpane-agent 0.3.x), charts stay empty unless you install kube-prometheus or equivalent scrapes.

**Supported agent path:** use **Owlpane Platform → Kubernetes (Owlpane agent)** starters and the **`Owlpane/Kubernetes * (Owlpane).dashboard.json`** tier.

See [METRICS-CONTRACT.md](../METRICS-CONTRACT.md).
