# Attribution

Dashboard JSON under `library/` is derived from the
[OpenObserve dashboards](https://github.com/openobserve/dashboards) community repository (Apache License 2.0).

- **Upstream:** https://github.com/openobserve/dashboards  
- **License:** see [library/LICENSE](./library/LICENSE)  
- **Owlpane changes:** display titles and chart colors are normalized for Owlpane branding; metric queries and panel
  layout follow the source. SQL/log/map panels that Owlpane does not support are dropped at import/conversion time in
  `owlpane-api` (see `scripts/build-starter-dashboards.ts`).

Do not remove this notice when syncing from upstream.
