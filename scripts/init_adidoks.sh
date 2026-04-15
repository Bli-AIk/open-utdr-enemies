#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
THEME_DIR="${ROOT_DIR}/themes/adidoks"
THEME_REPO="${ADIDOKS_REPO:-https://github.com/aaranxu/adidoks.git}"
THEME_REF="${ADIDOKS_REF:-main}"

mkdir -p "${ROOT_DIR}/themes"

if [ -d "${THEME_DIR}" ]; then
  printf 'Using existing theme directory: %s\n' "${THEME_DIR}"
else
  git clone --depth=1 --branch "${THEME_REF}" "${THEME_REPO}" "${THEME_DIR}"
fi

ZOLA_BIN=""
if command -v zola >/dev/null 2>&1; then
  ZOLA_BIN="$(command -v zola)"
elif [ -x "${ROOT_DIR}/.tools/zola" ]; then
  ZOLA_BIN="${ROOT_DIR}/.tools/zola"
else
  printf 'Warning: `zola` is not installed. Install it from https://www.getzola.org/documentation/getting-started/installation/\n' >&2
fi

cat <<'EOF'
AdiDoks bootstrap complete.

Next steps:
  python3 scripts/fetch_bilibili_opus.py --opus-id 1190046793906257945 --output content/docs/articles/opus-1190046793906257945.md --json-output data/bilibili/1190046793906257945.json
  zola serve
EOF

if [ -n "${ZOLA_BIN}" ]; then
  printf 'Detected Zola binary: %s\n' "${ZOLA_BIN}"
fi
