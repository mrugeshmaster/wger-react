#!/bin/bash
# Wrapper for vitest that ensures node_modules are installed.
# Forwards all arguments to vitest run so the Skyramp adapter can append
# reporter flags and file selectors.
set -euo pipefail

REPO_ROOT="$(dirname "$0")/../.."
cd "$REPO_ROOT"

if [ ! -d node_modules/.bin ]; then
  npm ci
fi

exec node_modules/.bin/vitest run "$@"
