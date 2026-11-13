#!/usr/bin/env bash
# Refresh library/ from the Apache-2.0 dashboard collection only. We do not fork — download only.
# Do not point this script at the AGPL-3.0 engine, and do not vendor that engine under this repo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIB="$ROOT/library"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Fetching openobserve/dashboards main tarball…"
curl -fsSL "https://github.com/openobserve/dashboards/archive/refs/heads/main.tar.gz" | tar xz -C "$TMP"
SRC="$(find "$TMP" -maxdepth 1 -type d -name 'dashboards-*' | head -1)"
[[ -n "$SRC" ]] || { echo "extract failed"; exit 1; }

mkdir -p "$LIB"
rsync -a --delete --exclude='.git' --exclude='.github' "$SRC/" "$LIB/"
node "$ROOT/scripts/normalize-for-owlpane.mjs" "$LIB"
echo "Done. Re-run owlpane-api: npx tsx scripts/build-starter-dashboards.ts $LIB"
