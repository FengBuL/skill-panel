#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
APP_NAME="Skill Panel.app"
SRC_APP="$ROOT_DIR/src-tauri/target/release/bundle/macos/$APP_NAME"
DST_APP="/Applications/$APP_NAME"
BACKUP_DIR="/Applications/Skill Panel.app.backup-$(date +%Y%m%d%H%M%S)"
PNPM_BIN="${PNPM_BIN:-pnpm}"

TMP_BIN="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_BIN"
}
trap cleanup EXIT

cat > "$TMP_BIN/npm" <<SH
#!/usr/bin/env sh
exec "$PNPM_BIN" "\$@"
SH
chmod +x "$TMP_BIN/npm"

cd "$ROOT_DIR"
PATH="$TMP_BIN:$PATH" "$PNPM_BIN" exec tauri build --bundles app,dmg

if [ -d "$DST_APP" ]; then
  mv "$DST_APP" "$BACKUP_DIR"
  printf 'Backed up existing app: %s\n' "$BACKUP_DIR"
fi

cp -R "$SRC_APP" "$DST_APP"
xattr -dr com.apple.quarantine "$DST_APP" 2>/dev/null || true

printf 'Updated local app: %s\n' "$DST_APP"
plutil -p "$DST_APP/Contents/Info.plist" | grep -E 'CFBundleShortVersionString|CFBundleVersion|CFBundleIdentifier'
