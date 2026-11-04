"""SessionStart hook: show what's waiting to be edited so Claude starts with context.

stdout from a SessionStart hook is added to Claude's context. Keep it fast — no version probes.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")  # inbox names contain fullwidth ？ and ：

REPO = os.environ.get("CLAUDE_PROJECT_DIR", os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
WORKSPACE = os.environ.get("VIDEO_WORKSPACE", os.path.join(REPO, "workspace"))
MEDIA = (".mp4", ".mov", ".mkv", ".webm", ".m4a", ".mp3", ".wav")


def media_in(folder):
    try:
        return sorted(f for f in os.listdir(folder) if f.lower().endswith(MEDIA))
    except OSError:
        return None


lines = [f"Video workspace: {WORKSPACE}"]
for label, folder in [("Inbox (to edit)", os.path.join(WORKSPACE, "00_Inbox"))]:
    files = media_in(folder)
    if files is None:
        continue
    lines.append(f"{label}: {len(files)} file(s)")
    lines += [f"  - {f}" for f in files[:10]]

projects = os.path.join(WORKSPACE, "02_Projects")
if os.path.isdir(projects):
    recent = sorted((d for d in os.listdir(projects) if os.path.isdir(os.path.join(projects, d))),
                    key=lambda d: os.path.getmtime(os.path.join(projects, d)), reverse=True)[:3]
    if recent:
        lines.append("Most recent projects: " + ", ".join(recent))

print("\n".join(lines))
