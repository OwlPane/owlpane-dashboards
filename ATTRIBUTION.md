# Attribution

Dashboard JSON under `library/` is derived from the
[OpenObserve dashboards](https://github.com/openobserve/dashboards) community repository (Apache License 2.0).

- **Upstream:** https://github.com/openobserve/dashboards  
- **License:** see [library/LICENSE](./library/LICENSE)  
- **Owlpane changes:** display titles, chart colors, sample stream names, and filenames are normalized for Owlpane.
  Copyright lines in upstream files are left unchanged. Metric queries and panel layout otherwise follow the source.
  SQL/log/map panels that Owlpane does not support are dropped at import/conversion time in `owlpane-api` (see
  `scripts/build-starter-dashboards.ts`).

Do not remove this notice when syncing from upstream.
