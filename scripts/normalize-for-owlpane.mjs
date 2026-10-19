#!/usr/bin/env node
/**
 * Normalize community dashboard JSON, markdown, and filenames for Owlpane (Apache-2.0 source).
 * Does not change query semantics — titles, labels, documentation copy, filenames, and chart colors only.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, "..", "library"));
if (!fs.existsSync(root)) {
  console.error("library path missing:", root);
  process.exit(1);
}

// Remove any upstream CI workflows inside library/
fs.rmSync(path.join(root, ".github"), { recursive: true, force: true });

/** Owlpane console brand (--brand in console/src/index.css) */
const OWL_BRAND = "#0f7a4f";
const O2_PURPLES = ["#5960b2", "#5960B2", "#5b63b8", "#6366f1"];

const replaceVendorText = (s) => {
  if (typeof s !== "string") return s;
  let out = s
    .replace(/https?:\/\/github\.com\/openobserve\/openobserve-helm-chart[^\s)]*/gi, "https://github.com/OwlPane/owlpane-agent")
    .replace(/https?:\/\/github\.com\/openobserve\/[^\s)]*/gi, "https://github.com/OwlPane/owlpane-dashboards")
    .replace(/https?:\/\/openobserve\.ai[^\s)]*/gi, "https://owlpane.ai/docs")
    .replace(/openobserve\.ai/gi, "owlpane.ai")
    .replace(/openobserve-collector/gi, "owlpane-otel-collector")
    .replace(/ZO_USAGE_REPORTING_ENABLED/g, "OWLPANE_USAGE_REPORTING_ENABLED")
    .replace(/\bOpenObserve\b/gi, "Owlpane")
    .replace(/\bopenobserve\b/gi, "owlpane")
    .replace(/\bZincObserve\b/gi, "Owlpane")
    .replace(/\bzincobserve\b/gi, "owlpane")
    .replace(/grafana-dashboards\//gi, "dashboards/")
    .replace(/\bGrafana\b/gi, "Prometheus");
  for (const c of O2_PURPLES) out = out.split(c).join(OWL_BRAND);
  return out;
};

const walk = (v) => {
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = walk(val);
    return o;
  }
  return replaceVendorText(v);
};

// Pass 1: Rename top-level directories if needed
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
  if (!e.isDirectory()) continue;
  let nextName = e.name;
  if (/^openobserve$/i.test(nextName)) nextName = "Owlpane";
  else if (/openobserve-collector/i.test(nextName)) {
    nextName = nextName.replace(/openobserve-collector/gi, "owlpane-otel-collector");
  } else if (/openobserve/i.test(nextName)) {
    nextName = nextName.replace(/openobserve/gi, "Owlpane");
  }
  if (nextName !== e.name) {
    const src = path.join(root, e.name);
    const dst = path.join(root, nextName);
    fs.renameSync(src, dst);
  }
}

let jsonFiles = 0;
let textFiles = 0;
let renamedFiles = 0;

(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    let p = path.join(dir, e.name);
    if (e.isDirectory()) {
      scan(p);
      continue;
    }

    // Rename files that contain OpenObserve in their filename
    const parentName = path.basename(dir);
    let targetName = e.name;
    if (parentName === "Owlpane" && /^OpenObserve\s+/i.test(targetName)) {
      targetName = targetName.replace(/^OpenObserve\s+/i, "Owlpane Platform ");
    } else if (/openobserve/i.test(targetName)) {
      targetName = targetName.replace(/openobserve/gi, "Owlpane");
    }
    if (targetName !== e.name) {
      const nextPath = path.join(dir, targetName);
      fs.renameSync(p, nextPath);
      p = nextPath;
      renamedFiles++;
    }

    if (targetName.endsWith(".json")) {
      const raw = fs.readFileSync(p, "utf8");
      let json;
      try {
        json = JSON.parse(raw);
      } catch {
        continue;
      }
      const normalized = walk(json);
      if (
        parentName === "Owlpane" &&
        normalized &&
        typeof normalized === "object" &&
        typeof normalized.title === "string" &&
        /^Owlpane\s+(Infrastructure|Internals)$/i.test(normalized.title)
      ) {
        normalized.title = normalized.title.replace(/^Owlpane\s+/i, "Owlpane Platform ");
      }
      fs.writeFileSync(p, `${JSON.stringify(normalized, null, 2)}\n`);
      jsonFiles++;
    } else if (/\.(md|yaml|yml)$/i.test(targetName)) {
      const raw = fs.readFileSync(p, "utf8");
      let next = replaceVendorText(raw);
      if (parentName === "Owlpane" && /\.md$/i.test(targetName)) {
        next = next
          .replace(/# Owlpane Infrastructure/g, "# Owlpane Platform Infrastructure")
          .replace(/# Owlpane Internals/g, "# Owlpane Platform Internals");
      }
      if (next !== raw) {
        fs.writeFileSync(p, next);
      }
      textFiles++;
    }
  }
})(root);

console.log(
  `Normalized ${jsonFiles} JSON files, ${textFiles} doc/manifest files (${renamedFiles} renamed) under ${root}`,
);
