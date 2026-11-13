# Runtime security

Runtime findings from Falco and Tetragon on your Kubernetes clusters: what fired, where, and what was stopped.

This dashboard reads the findings that the agent's `security-bridge` image sends to Owlpane. It does not read raw Falco or Tetragon logs, so it works without any parsing rules.

## What you see

**Overview**

- Totals for runtime findings, by severity (critical, high, medium) and by source (Falco, Tetragon).
- Top rules and policies, with their severity and source.
- Namespaces, pods, executables, files and kernel functions, and nodes with the most findings.

**Events**

- Recent findings, newest first.
- Findings stopped by a Tetragon policy (action `SIGKILL`, `OVERRIDE`, `SIGNAL` or `NOTIFYENFORCER`). Policies that only observe are not listed here.
- Repeated findings: events the bridge held back because the same one fired again inside its dedupe window.

## Set up

1. Turn on the bridge in the agent's Helm values (`securityBridge.enabled`). The chart refuses to render with an open endpoint, so set at least one of `securityBridge.token.existingSecret` (senders send it as a bearer token) and `securityBridge.allowFrom` (a NetworkPolicy allow-list).
2. Point Falco at it with `http_output` (`url: http://<bridge service>:<port>/falco`, with the bearer token header).
3. For Tetragon, ship its JSON export to `/tetragon`. Policy events (`process_kprobe`, `process_tracepoint`, `process_lsm`, `process_uprobe`, `process_usdt`) are kept; plain `process_exec` and `process_exit` are skipped to keep volume down.

The panels show nothing until the first finding arrives.

## Fields used

Findings are logs from service `owlpane-security` with `owlpane.finding.kind = runtime`. Panels group on these attributes:

| Attribute | Meaning |
|-----------|---------|
| `owlpane.finding.title` | Falco rule or Tetragon policy |
| `owlpane.finding.severity` | critical, high, medium, low |
| `owlpane.finding.source` | `falco` or `tetragon` |
| `k8s.namespace.name`, `k8s.pod.name`, `k8s.node.name` | Where it happened |
| `owlpane.runtime.process`, `owlpane.runtime.target` | Executable and the file or kernel function involved |
| `owlpane.runtime.action` | Tetragon action taken |
| `owlpane.runtime.suppressed` | Repeats held back by the dedupe window |
