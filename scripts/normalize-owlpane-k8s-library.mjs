#!/usr/bin/env node
/**
 * Rewrites Kubernetes(owlpane-otel-collector) library JSON to Owlpane agent metric / label names.
 * Run from owlpane-dashboards repo root:
 *   node scripts/normalize-owlpane-k8s-library.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "../library/Kubernetes(owlpane-otel-collector)");
if (!fs.existsSync(root)) {
  console.error("missing", root);
  process.exit(1);
}

const METRIC = [
  ["k8s_pod_cpu_usage", "k8s.pod.cpu.time"],
  ["k8s_pod_cpu_utilization", "k8s.pod.cpu.time"],
  ["k8s_pod_cpu_request_utilization", "k8s.pod.cpu.time"],
  ["k8s_pod_cpu_limit_utilization", "k8s.pod.cpu.time"],
  ["k8s_pod_memory_usage", "k8s.pod.memory.usage"],
  ["k8s_pod_memory_working_set", "k8s.pod.memory.usage"],
  ["k8s_pod_memory_request_utilization", "k8s.pod.memory.usage"],
  ["k8s_pod_memory_limit_utilization", "k8s.pod.memory.usage"],
  ["k8s_node_cpu_usage", "k8s.node.cpu.time"],
  ["k8s_node_memory_rss", "k8s.node.memory.usage"],
  ["k8s_node_allocatable_cpu", "k8s.node.allocatable_cpu"],
  ["kube_node_info", "k8s.node.allocatable_cpu"],
  ["k8s_cronjob_active_jobs", "k8s.cronjob.active_jobs"],
  ["k8s_daemonset_current_scheduled_nodes", "k8s.daemonset.current_scheduled_nodes"],
  ["k8s_deployment_available", "k8s.deployment.available"],
  ["k8s_statefulset_current_pods", "k8s.statefulset.current_pods"],
  ["system_memory_utilization", "system.memory.utilization"],
  ["system_disk_operations", "system.disk.operations"],
  ["system_disk_io", "system.disk.io"],
];

const LABEL = [
  ["k8s_cluster", "k8s.cluster.name"],
  ["k8s_node_name", "k8s.node.name"],
  ["k8s_namespace_name", "k8s.namespace.name"],
  ["k8s_pod_name", "k8s.pod.name"],
];

function rewrite(text) {
  let out = text;
  for (const [from, to] of METRIC) {
    out = out.replaceAll(from, to);
  }
  for (const [from, to] of LABEL) {
    out = out.replaceAll(`"${from}"`, `"${to}"`);
    out = out.replaceAll(`${from}=`, `${to}=`);
    out = out.replaceAll(`${from}=~`, `${to}=~`);
    out = out.replaceAll(`$${from}`, `$${to.replaceAll(".", "_")}`);
  }
  out = out.replaceAll("COALESCE(NULLIF(k8s_namespace_name, ''), 'default')", "coalesce(k8s_namespace_name, 'default')");
  out = out.replaceAll(/\bcount\s*\(\s*_timestamp\s*\)/gi, "count(*)");
  return out;
}

const files = fs.readdirSync(root).filter((f) => f.endsWith(".json") && f !== "kubernetes_overview.json");
for (const f of files) {
  const p = path.join(root, f);
  const next = rewrite(fs.readFileSync(p, "utf8"));
  if (next !== fs.readFileSync(p, "utf8")) {
    fs.writeFileSync(p, next);
    console.log("updated", f);
  }
}
console.log("done", files.length, "files");
