"""PreToolUse(Bash) hook: keep Claude attribution out of git commit messages.

Matches the attribution trailers only, not the bare word "claude" (the repo is called
claude-video-editor and has a CLAUDE.md, so those must stay committable).
"""
import json
import re
import sys

sys.stderr.reconfigure(encoding="utf-8")

ATTRIBUTION = re.compile(
    r"Co-Authored-By:[^\n]*(Claude|anthropic)"
    r"|noreply@anthropic\.com"
    r"|Generated with \[?Claude Code"
    r"|Claude-Session:",
    re.I,
)

cmd = json.load(sys.stdin).get("tool_input", {}).get("command", "")
if re.search(r"\bgit\b.*\b(commit|tag)\b", cmd, re.S) and ATTRIBUTION.search(cmd):
    print("Blocked by no_claude_in_commits hook: remove the Claude attribution "
          "(Co-Authored-By / Generated with Claude Code) from the commit message and retry.",
          file=sys.stderr)
    sys.exit(2)
sys.exit(0)
