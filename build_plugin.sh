#!/bin/bash

set -euo pipefail

# Basic config
PLUGIN_DIR="extension"
APP_SRC_DIR="dist"
APP_DEST_DIR="$PLUGIN_DIR/app"
DEST_DIR=${DEST_DIR:-"."}
NAME_BASE="PromptLab"
TARGET=${TARGET:-firefox}

# Derive version from manifest.json (fallback if not found)
MANIFEST="$PLUGIN_DIR/manifest.json"
if [[ -f "$MANIFEST" ]]; then
  VERSION=$(sed -n 's/^[[:space:]]*\"version\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p' "$MANIFEST" | head -n1)
fi
VERSION=${VERSION:-0.0.1}

# Build artifact name (.xpi is just a zip)
SAFE_VER=${VERSION//./_}
XPI_FILE="${NAME_BASE}_v${SAFE_VER}.xpi"

echo "Building ${XPI_FILE} from ${PLUGIN_DIR}..."

# Bundle content scripts for Firefox MV2 (no module scripts)
if [[ -f "bundle-content-scripts.js" ]]; then
  echo "Bundling content scripts..."
  node bundle-content-scripts.js
fi

# Ensure Vite app build is available and bundled into extension
if [[ -d "$APP_SRC_DIR" ]]; then
  echo "Bundling Vite app from '$APP_SRC_DIR' into '$APP_DEST_DIR'..."
  rm -rf "$APP_DEST_DIR"
  mkdir -p "$APP_DEST_DIR"
  # Copy built files
  cp -R "$APP_SRC_DIR"/* "$APP_DEST_DIR"/
  # Ensure all asset URLs point to /app/assets/ so they resolve inside the
  # extension bundle (moz-extension://.../app/index.html → /app/assets/...)
  # Update in HTML, JS, and CSS files.
  # Index HTML: fix common attributes
  if [[ -f "$APP_DEST_DIR/index.html" ]]; then
    sed -i \
      -e 's#src="/assets/#src="/app/assets/#g' \
      -e 's#href="/assets/#href="/app/assets/#g' \
      "$APP_DEST_DIR/index.html" || true
  fi
  # All files: replace bare "/assets/" occurrences with "/app/assets/"
  while IFS= read -r -d '' f; do
    sed -i \
      -e 's#"/assets/#"/app/assets/#g' \
      -e "s#'/assets/#'/app/assets/#g" \
      -e 's#`/assets/#`/app/assets/#g' \
      "$f" || true
  done < <(find "$APP_DEST_DIR" -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -print0)
else
  echo "Warning: '$APP_SRC_DIR' not found. Run 'yarn build' first to generate the Vite app. The extension pages expect app/ to exist." >&2
fi

# If web-ext is available and USE_WEB_EXT=1, prefer it for packaging
if command -v web-ext >/dev/null 2>&1 && [[ "${USE_WEB_EXT:-0}" == "1" ]]; then
  echo "web-ext detected; packaging with web-ext build..."
  web-ext build \
    --source-dir "$PLUGIN_DIR" \
    --artifacts-dir . \
    --overwrite-dest \
    --filename "$XPI_FILE"
else
  # Create ZIP with manifest at archive root by zipping from inside extension/
  (
    cd "$PLUGIN_DIR"
    # If targeting Firefox, temporarily swap in MV2 manifest for compatibility
    if [[ "$TARGET" == "firefox" && -f manifest.firefox.json ]]; then
      echo "Using Firefox MV2 manifest for packaging..."
      cp manifest.json ".manifest.json.bak" 2>/dev/null || true
      cp manifest.firefox.json manifest.json
    fi
    # -r recursive, -F fix zip structure timestamps, -S save entries unchanged
    zip -r -FS "../$XPI_FILE" . -x "**/.DS_Store"
    # Restore original manifest if we swapped
    if [[ -f ".manifest.json.bak" ]]; then
      mv -f ".manifest.json.bak" manifest.json
    fi
  )
fi

# Quick structure check: ensure manifest.json is at archive root
if command -v unzip >/dev/null 2>&1; then
  if ! unzip -l "$XPI_FILE" | awk '{print $4}' | grep -qx "manifest.json"; then
    echo "Error: manifest.json is not at the archive root. Packaging failed." >&2
    exit 1
  fi
else
  echo "Note: 'unzip' not available; skipping structure verification."
fi

# Move artifact to destination
mkdir -p "$DEST_DIR"
mv -f "$XPI_FILE" "$DEST_DIR/"
echo "Done: $DEST_DIR/$XPI_FILE"
echo "Tip: For Firefox dev testing, use about:debugging → Load Temporary Add-on → select manifest.json."
