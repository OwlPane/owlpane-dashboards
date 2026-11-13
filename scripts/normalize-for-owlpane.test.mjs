import test from "node:test";
import assert from "node:assert/strict";
import {
  replaceVendorText,
  stripO2Filename,
  replacementStream,
  scrubO2Streams,
} from "./normalize-for-owlpane.mjs";

test("copyright lines keep the upstream name", () => {
  const input = "Copyright 2024 OpenObserve, Inc.\nTitle OpenObserve dashboard";
  const out = replaceVendorText(input);
  assert.equal(out.split("\n")[0], "Copyright 2024 OpenObserve, Inc.");
  assert.equal(out.split("\n")[1], "Title Owlpane dashboard");
});

test("sample zinclabs streams and domains are rewritten, including on a copyright line that stays", () => {
  const input = "Copyright 2024 Zinc Labs (zinclabs.dev)\nFROM \"route53_zinclabs_dev\" WHERE name = 'dev.zinclabs.dev'";
  const out = replaceVendorText(input);
  assert.equal(out.split("\n")[0], "Copyright 2024 Zinc Labs (zinclabs.dev)");
  assert.equal(out.split("\n")[1], 'FROM "route53" WHERE name = \'dev.example.com\'');
  assert.equal(out.split("\n")[1].includes("zinclabs"), false);
});

test("o2 filename segments are removed", () => {
  assert.equal(stripO2Filename("cloudtrail_o2_dashboard.GIF"), "cloudtrail_dashboard.GIF");
  assert.equal(stripO2Filename("openvpn-o2-dashboards.gif"), "openvpn-dashboards.gif");
  assert.equal(stripO2Filename("explore-dashboards-in-o2.gif"), "explore-dashboards-in.gif");
  assert.equal(stripO2Filename("o2-dashboard.jpeg"), "dashboard.jpeg");
  assert.equal(stripO2Filename("Host Metrics.dashboard.json"), "Host Metrics.dashboard.json");
});

test("_o2_ stream fields follow the query FROM clause", () => {
  const query = {
    query: "SELECT 1 FROM logs.k8s_events WHERE body_kind = 'Pod'",
    fields: { stream: "_o2_service_graph" },
  };
  assert.equal(replacementStream(query.fields.stream, query.query), "k8s_events");
  scrubO2Streams(query);
  assert.equal(query.fields.stream, "k8s_events");

  const stub = { query: "SELECT '0' AS vpa_count from default", fields: { stream: "_o2_service_graph" } };
  scrubO2Streams(stub);
  assert.equal(stub.fields.stream, "default");
});
