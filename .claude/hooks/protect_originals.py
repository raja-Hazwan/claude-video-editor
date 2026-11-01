"""PreToolUse(Bash) hook: never write to, move or delete original media.

Blocks a Bash command when it would delete or overwrite files in the source folders
(00_Inbox, 01_Sources, 04_Footage, Video/ except Video/Subtitles/). Reading them (ffmpeg -i, ffprobe) is fine,
and so is moving a file from one of these folders to another (Inbox -> Sources).
Exit code 2 blocks the call and shows stderr to Claude.
"""
import json
import re
import shlex
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# Video/Subtitles/ is excluded: subtitles are generated files and get rewritten.
PROTECTED = re.compile(r"(00_Inbox|01_Sources|04_Footage)([\\/]|$)|(^|[\\/])Video[\\/](?!Subtitles([\\/]|$))", re.I)
DESTRUCTIVE = {"rm", "del", "rmdir", "mv", "move", "Remove-Item", "Move-Item", "ren", "rename"}

cmd = json.load(sys.stdin).get("tool_input", {}).get("command", "")


def block(reason):
    print(f"Blocked by protect_originals hook: {reason}\n"
          "Originals are read-only. Write outputs to the project's out/ folder or 03_Exports instead.",
          file=sys.stderr)
    sys.exit(2)


for part in re.split(r"&&|\|\||;|\|", cmd):
    try:
        tokens = shlex.split(part, posix=True)
    except ValueError:
        tokens = part.split()
    if not tokens:
        continue
    prog = tokens[0]
    paths = [t for t in tokens[1:] if not t.startswith("-")]
    if prog in DESTRUCTIVE and any(PROTECTED.search(t) for t in paths):
        # Moving between stage folders (Inbox -> Sources) is the normal workflow; allow it.
        is_move = prog in {"mv", "move", "Move-Item", "ren", "rename"}
        if not (is_move and all(PROTECTED.search(t) for t in paths)):
            block(f"`{prog}` on a protected folder")
    if prog in ("ffmpeg", "ffmpeg.exe"):
        # ffmpeg's output is the last non-option argument; inputs follow -i
        inputs = {tokens[i + 1] for i, t in enumerate(tokens[:-1]) if t == "-i"}
        out = tokens[-1]
        if out not in inputs and PROTECTED.search(out):
            block("ffmpeg output path is inside a protected folder")
    redirect = re.search(r">\s*(\"[^\"]+\"|\S+)", part)
    if redirect and PROTECTED.search(redirect.group(1)):
        block("shell redirect into a protected folder")

sys.exit(0)
