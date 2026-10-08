#!/usr/bin/env bash
# Type-checks the *packed* package from a consumer on the oldest stack we
# support (React 18 + RN 0.76), under both classic ("node") and "bundler"
# module resolution. Fails if the package or the consumer code has errors.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

REACT="${COMPAT_REACT:-18.3.1}"
REACT_TYPES="${COMPAT_REACT_TYPES:-18.3.12}"
RN="${COMPAT_RN:-0.76.9}"
RHF="${COMPAT_RHF:-7.54.0}"
TS="${COMPAT_TS:-5.6.3}"

(cd "$ROOT" && yarn prepare >/dev/null)
TARBALL="$(cd "$ROOT" && npm pack --pack-destination "$WORK" 2>/dev/null | tail -1)"

cd "$WORK"
echo '{"name":"compat","private":true}' > package.json
cp "$ROOT/scripts/compat/consumer.tsx" .
npm install --no-audit --no-fund --ignore-scripts --legacy-peer-deps \
  "react@$REACT" "@types/react@$REACT_TYPES" "react-native@$RN" \
  "react-hook-form@$RHF" "typescript@$TS" "./$TARBALL" >/dev/null

status=0
for MR in node bundler; do
  MOD=$([ "$MR" = bundler ] && echo esnext || echo commonjs)
  cat > tsconfig.json <<JSON
{
  "compilerOptions": {
    "strict": true, "jsx": "react-native", "module": "$MOD",
    "moduleResolution": "$MR", "target": "esnext", "lib": ["esnext"],
    "noEmit": true, "skipLibCheck": false, "esModuleInterop": true,
    "types": ["react-native"]
  },
  "files": ["consumer.tsx"]
}
JSON
  npx tsc -p tsconfig.json > out.txt 2>&1 || true
  # react-hook-form's own .d.ts reference DOM types (FileList…) that RN
  # projects don't include; they're not ours, so ignore just those.
  errors="$(grep 'error TS' out.txt | grep -v 'react-hook-form/dist/' || true)"
  if [ -n "$errors" ]; then
    echo "✗ $MR resolution (React $REACT, RN $RN):"; echo "$errors"; status=1
  else
    echo "✓ $MR resolution (React $REACT, RN $RN)"
  fi
done
exit $status
