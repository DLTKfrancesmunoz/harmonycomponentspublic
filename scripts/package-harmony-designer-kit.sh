#!/usr/bin/env bash
# Package harmony-designer-starter/ into a zip for distribution.
# Run from repo root: ./scripts/package-harmony-designer-kit.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STARTER="$REPO_ROOT/harmony-designer-starter"
OUT_DIR="${1:-$REPO_ROOT/dist-kit}"
ZIP_NAME="${2:-harmony-designer-starter.zip}"

if [[ ! -d "$STARTER" ]]; then
  echo "error: expected starter at $STARTER" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
STAGING="$OUT_DIR/_staging_harmony_designer_starter"
rm -rf "$STAGING"
mkdir -p "$STAGING"

rsync -a \
  --exclude node_modules \
  --exclude dist \
  --exclude .DS_Store \
  "$STARTER/" "$STAGING/harmony-designer-starter/"

( cd "$STAGING" && zip -r -q "$OUT_DIR/$ZIP_NAME" "harmony-designer-starter" )
rm -rf "$STAGING"

echo "Wrote $OUT_DIR/$ZIP_NAME"
