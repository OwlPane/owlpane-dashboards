#!/usr/bin/env node
/**
 * Rewrites library JSON to Owlpane agent OTel metric / label names.
 *   node scripts/normalize-owlpane-k8s-library.mjs
 *   node scripts/normalize-owlpane-k8s-library.mjs --dry-run
 *
 * Then: node scripts/fix-owlpane-library-variables.mjs
 */
import fs from "node:fs";
import path from "node:path";

const dryRun = process.argv.includes("--dry-run");
const libraryRoot = path.join(import.meta.dirname, "../library");

/** Keep in sync with owlpane-api src/product/metric-aliases.ts LEGACY_METRIC_TO_OTEL */
const METRIC = [
  ["k8s_hpa_desired_replicas", "k8s.hpa.desired_replicas"],
  ["k8s_node_condition_ready", "k8s.node.condition_ready"],
  ["k8s_node_condition_disk_pressure", "k8s.node.condition_disk_pressure"],
  ["k8s_node_condition_memory_pressure", "k8s.node.condition_memory_pressure"],
  ["k8s_node_condition_pid_pressure", "k8s.node.condition_pid_pressure"],
  ["k8s_pod_cpu_request_utilization", "k8s.pod.cpu.time"],
  ["k8s_pod_cpu_limit_utilization", "k8s.pod.cpu.time"],
  ["k8s_pod_cpu_utilization", "k8s.pod.cpu.time"],
  ["k8s_pod_cpu_usage", "k8s.pod.cpu.time"],
  ["k8s_pod_memory_request_utilization", "k8s.pod.memory.usage"],
  ["k8s_pod_memory_limit_utilization", "k8s.pod.memory.usage"],
  ["k8s_pod_memory_working_set", "k8s.pod.memory.usage"],
  ["k8s_pod_memory_rss", "k8s.pod.memory.usage"],
  ["k8s_pod_memory_usage", "k8s.pod.memory.usage"],
  ["k8s_pod_network_io", "k8s.pod.network.io"],
  ["k8s_node_network_io", "k8s.pod.network.io"],
  ["k8s_node_cpu_usage", "k8s.node.cpu.time"],
  ["k8s_node_memory_rss", "k8s.node.memory.usage"],
  ["k8s_node_allocatable_cpu", "k8s.node.allocatable_cpu"],
  ["k8s_node_allocatable_memory", "k8s.node.allocatable_memory"],
  ["kube_node_info", "k8s.node.allocatable_cpu"],
  ["k8s_cronjob_active_jobs", "k8s.cronjob.active_jobs"],
  ["k8s_daemonset_current_scheduled_nodes", "k8s.daemonset.current_scheduled_nodes"],
  ["k8s_deployment_available", "k8s.deployment.available"],
  ["k8s_statefulset_current_pods", "k8s.statefulset.current_pods"],
  ["system_cpu_utilization", "system.cpu.utilization"],
  ["system_memory_utilization", "system.memory.utilization"],
  ["system_disk_operations", "system.disk.operations"],
  ["system_disk_io", "system.disk.io"],
].sort((a, b) => b[0].length - a[0].length);

/** PromQL / stream label keys only — never rewrite variables.list[].name (use fix-owlpane-library-variables.mjs). */
const PROMQL_LABEL = [
  ["k8s_cluster", "k8s.cluster.name"],
  ["k8s_namespace_name", "k8s.namespace.name"],
  ["k8s_node_name", "k8s.node.name"],
  ["k8s_pod_name", "k8s.pod.name"],
];

function rewrite(text) {
  let out = text;
  for (const [from, to] of METRIC) {
    out = out.replaceAll(from, to);
  }
  for (const [from, to] of PROMQL_LABEL) {
    out = out.replaceAll(`${from}=`, `${to}=`);
    out = out.replaceAll(`${from}=~`, `${to}=~`);
    out = out.replaceAll(`${from}!=`, `${to}!=`);
  }
  out = out.replaceAll("COALESCE(NULLIF(k8s_namespace_name, ''), 'default')", "coalesce(k8s_namespace_name, 'default')");
  out = out.replaceAll(/\bcount\s*\(\s*_timestamp\s*\)/gi, "count(*)");
  return out;
}

function targets() {
  const out = [];
  const k8s = path.join(libraryRoot, "Kubernetes(owlpane-otel-collector)");
  if (fs.existsSync(k8s)) {
    for (const f of fs.readdirSync(k8s)) {
      if (f.endsWith(".json") && f !== "kubernetes_overview.json") out.push(path.join(k8s, f));
    }
  }
  const owlpane = path.join(libraryRoot, "Owlpane");
  if (fs.existsSync(owlpane)) {
    for (const f of fs.readdirSync(owlpane)) {
      if (/kubernetes|platform/i.test(f) && f.endsWith(".dashboard.json")) out.push(path.join(owlpane, f));
    }
  }
  return out;
}

let changed = 0;
for (const p of targets()) {
  const before = fs.readFileSync(p, "utf8");
  const next = rewrite(before);
  if (next !== before) {
    if (!dryRun) fs.writeFileSync(p, next);
    changed++;
    console.log(dryRun ? "would update" : "updated", path.relative(libraryRoot, p));
  }
}
console.log(`${dryRun ? "dry-run: " : ""}${changed} of ${targets().length} files`);
