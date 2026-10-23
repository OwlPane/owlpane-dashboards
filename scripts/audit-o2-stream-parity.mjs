#!/usr/bin/env node
/**
 * Report metric stream refs in library JSON vs Tier-1 agent contract.
 * Exit 1 when otel-collector JSON still references unmapped legacy streams.
 *
 *   node scripts/audit-o2-stream-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";

const libraryRoot = path.join(import.meta.dirname, "../library");
const AGENT_OTEL = new Set([
  "k8s.node.allocatable_cpu", "k8s.node.cpu.time", "k8s.node.memory.usage",
  "k8s.node.condition_ready", "k8s.node.condition_disk_pressure",
  "k8s.node.condition_memory_pressure", "k8s.node.condition_pid_pressure",
  "k8s.pod.cpu.time", "k8s.pod.memory.usage", "k8s.pod.network.io",
  "k8s.deployment.available", "k8s.statefulset.current_pods", "k8s.hpa.desired_replicas",
  "k8s.cronjob.active_jobs", "k8s.daemonset.current_scheduled_nodes",
  "system.cpu.utilization", "system.memory.utilization", "system.disk.operations", "system.disk.io",
  "argocd_app_info", "argocd_app_k8s_request_total", "argocd_redis_request_total",
  "owlpane_ingest_bytes_total", "owlpane_ingest_batches_total",
]);

const LEGACY_OK_PREFIX = /^(k8s\.|system\.|argocd_|owlpane_)/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}

function streamsInFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const found = new Set();
  for (const m of text.matchAll(/"stream"\s*:\s*"([^"]+)"/g)) {
    const s = m[1];
    if (s && !s.includes("k8s_events")) found.add(s);
  }
  return found;
}

const k8sDir = path.join(libraryRoot, "Kubernetes(owlpane-otel-collector)");
let bad = [];
if (fs.existsSync(k8sDir)) {
  for (const f of walk(k8sDir)) {
    if (f.endsWith("kubernetes_overview.json")) continue;
    for (const s of streamsInFile(f)) {
      if (LEGACY_OK_PREFIX.test(s) || AGENT_OTEL.has(s)) continue;
      if (s.startsWith("kube_") || s.startsWith("k8s_") || s.startsWith("container_") || s.startsWith("apiserver_")) {
        bad.push({ file: path.relative(libraryRoot, f), stream: s });
      }
    }
  }
}

if (bad.length) {
  console.error("Unmapped legacy streams in otel-collector JSON (run normalize-owlpane-k8s-library.mjs):");
  for (const b of bad) console.error(`  ${b.file}: ${b.stream}`);
  process.exit(1);
}

console.log("OK: otel-collector metric streams are OTel or mapped legacy-free");
