#!/usr/bin/env bash
# The sample photos/footage for the five photographic skills (and the preview videos) are media, so git ignores them.
# On a fresh clone, run this once to pull them from the upstream repo at the commit this copy came from.
set -euo pipefail
C="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # .claude
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
git clone -q https://github.com/artemnovitckii/claude-editing-skills "$TMP/up"
git -C "$TMP/up" checkout -q beff6b8
cp -rn "$TMP/up/assets/style-showcase/." "$C/assets/style-showcase/"
cp -rn "$TMP/up/docs/style-showcase/." "$C/docs/style-showcase/"
echo "sample media in $C/assets/style-showcase and $C/docs/style-showcase"
