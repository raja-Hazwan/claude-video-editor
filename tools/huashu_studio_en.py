"""Translate the huashu-motion studio UI (om studio) from Chinese to English, in place.

    python tools/huashu_studio_en.py            # patch
    python tools/huashu_studio_en.py --check    # list any Chinese left, change nothing

The studio has no language switch, so this rewrites the strings in studio/index.html and studio/studio.js of the
huashu-motion install (HUASHU_MOTION_DIR, default ~/tools/huashu-motion). Safe to re-run; run it again after
updating huashu-motion (git pull there brings the Chinese back). Restart om studio and reload the page after.
"""
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.environ.get("HUASHU_MOTION_DIR", os.path.join(os.path.expanduser("~"), "tools", "huashu-motion"))
CJK = re.compile(r"[　-〿一-鿿＀-￯]")

HTML = [
    ('lang="zh-CN"', 'lang="en"'),
    (">连接中<", ">Connecting<"),
    ('title="撤回到上一版 (⌘Z)">撤回<', 'title="Undo to the previous version (⌘Z)">Undo<'),
    (">导出视频<", ">Export video<"),
    (">MP4 视频<", ">MP4 video<"),
    (">MOV（透明底）<", ">MOV (transparent)<"),
    (">GIF 动图<", ">GIF<"),
    ('aria-label="工具"', 'aria-label="Tools"'),
    ('title="选择 (V)"', 'title="Select (V)"'),
    ('title="在画面上留言给 Agent (C)"', 'title="Comment on the frame for the agent (C)"'),
    ('placeholder="告诉 Agent 这里要怎么改，比如：这里多停一拍"',
     'placeholder="Tell the agent what to change here, e.g. hold this a beat longer"'),
    ("⌘↩ 发送 · Esc 取消", "⌘↩ send · Esc cancel"),
    (">发给 Agent<", ">Send to agent<"),
    ("<b>还没有 Agent 在接单。</b>在你的 Agent 里说「处理 huashu-motion 的评论」，或在终端运行：",
     "<b>No agent is picking up comments yet.</b> Tell your agent “handle the huashu-motion comments”, or run in a terminal:"),
    (">复制<", ">Copy<"),
    ('data-tab="props">参数<', 'data-tab="props">Properties<'),
    ('data-tab="comments">评论 ', 'data-tab="comments">Comments '),
    ("点画面里的元素查看它，双击文字直接改；按 <kbd>C</kbd> 在画面上给 Agent 留言。",
     "Click an element in the frame to inspect it, double-click text to edit it; press <kbd>C</kbd> to leave the agent a comment on the frame."),
    ('title="播放 / 暂停 (空格)"', 'title="Play / pause (Space)"'),
    ("空格 播放 · ←→ 逐帧 · C 留言 · ⌘Z 撤回", "Space play · ←→ step frame · C comment · ⌘Z undo"),
]

JS = [
    ("'与 studio 断开，重新运行 om studio'", "'Disconnected from the studio: run om studio again'"),
    ("'这段文字没有绑定参数，按 C 留言让 Agent 改'", "'This text is not bound to a property: press C and ask the agent to change it'"),
    ("'文件刚被 Agent 改过，已载入最新版本，请再改一次。'",
     "'The agent just changed the file. The latest version is loaded, please make your edit again.'"),
    ("'点画面里的元素查看它，双击文字直接改；按 ', el('kbd', {}, 'C'), ' 在画面上给 Agent 留言。'",
     "'Click an element in the frame to inspect it, double-click text to edit it; press ', el('kbd', {}, 'C'), ' to leave the agent a comment on the frame.'"),
    ("`${label} · 画布` : '画布'", "`${label} · canvas` : 'canvas'"),
    ("'留言给 Agent'", "'Comment for agent'"),
    ("`可直接改：${linked.map((id) => S.variables.find((v) => v.id === id)?.label || id).join('、')}`",
     "`Editable here: ${linked.map((id) => S.variables.find((v) => v.id === id)?.label || id).join(', ')}`"),
    ("'这个元素没有绑定参数，留言让 Agent 改。'", "'This element has no bound properties: leave a comment for the agent.'"),
    ("` · 场景 ${esc(scene)}`", "` · scene ${esc(scene)}`"),
    ("'已发给 Agent。它接单后，这里会显示进度。'", "'Sent to the agent. Progress shows here once it picks it up.'"),
    ("{ pending: '待处理', working: 'Agent 正在改', done: '已完成', cancelled: '已取消' }",
     "{ pending: 'Pending', working: 'Agent working', done: 'Done', cancelled: 'Cancelled' }"),
    ("'还没有评论。按 C，再点画面上想改的地方。'", "'No comments yet. Press C, then click the spot you want changed.'"),
    ("} }, '取消')", "} }, 'Cancel')"),
    ("} }, '没改对')", "} }, 'Not right')"),
    ("m.text || '已处理'", "m.text || 'Handled'"),
    ("placeholder: '哪里还不对？比如：再慢一点，或者换成蓝色'", "placeholder: 'What is still off? e.g. a bit slower, or make it blue'"),
    ("toast('已发回给 Agent')", "toast('Sent back to the agent')"),
    ("'⌘↩ 发送'", "'⌘↩ send'"),
    ("onclick: send }, '发回给 Agent')", "onclick: send }, 'Send back to agent')"),
    ("'正在导出视频…'", "'Exporting video…'"),
    ("`Agent 正在改：${working.text.slice(0, 18)}", "`Agent working: ${working.text.slice(0, 18)}"),
    ("`${waiting.length} 条评论等 Agent 接单`", "`${waiting.length} comment(s) waiting for the agent`"),
    ("`已保存 · 第 ${S.history} 版`", "`Saved · version ${S.history}`"),
    ("toast('已复制')", "toast('Copied')"),
    ("'这个工程还没有可直接改的参数。让 Agent 把标题、数字、颜色声明成变量（data-composition-variables），这里就会出现输入框。'",
     "'This project has no editable properties yet. Ask the agent to declare titles, numbers and colours as variables (data-composition-variables) and inputs will appear here.'"),
    ("v.group || '画面参数'", "v.group || 'Frame properties'"),
    ("'没有分镜标签。时间轴上加 tl.addLabel(\"scene:名字\", 秒)，这里就会分段。'",
     "'No scene labels. Add tl.addLabel(\"scene:name\", seconds) on the timeline and the strip splits here.'"),
    ("toast('已撤回到上一版')", "toast('Undone to the previous version')"),
    ("'没有可以撤回的版本'", "'Nothing to undo'"),
    ("`正在导出 ${job.format.toUpperCase()}…", "`Exporting ${job.format.toUpperCase()}…"),
    ("'首次导出会下载渲染器，需要几分钟'", "'The first export downloads the renderer and takes a few minutes'"),
    ("`导出完成：<a", "`Export done: <a"),
    ("`导出失败：${esc(job.error)}`", "`Export failed: ${esc(job.error)}`"),
    ("'studio 启动失败：'", "'Studio failed to start: '"),
]


def patch(path, pairs, check):
    s = open(path, encoding="utf-8", newline="").read()
    done = missing = 0
    for zh, en in pairs:
        if zh in s:
            done += 1
            if not check:
                s = s.replace(zh, en)
        elif en not in s:
            missing += 1
            print(f"  not found (huashu changed?): {zh[:70]}")
    if not check and done:
        open(path, "w", encoding="utf-8", newline="").write(s)
    left = [f"  {os.path.basename(path)}:{i}: {l.strip()[:120]}" for i, l in enumerate(s.splitlines(), 1) if CJK.search(l)]
    verb = "would translate" if check else "translated"
    print(f"{os.path.basename(path)}: {verb} {done}, already English {len(pairs) - done - missing}, not found {missing}, Chinese lines left {len(left)}")
    for l in left:
        print(l)
    return not left and not missing


def main():
    check = "--check" in sys.argv
    studio = os.path.join(ROOT, "studio")
    if not os.path.isdir(studio):
        sys.exit(f"huashu-motion studio not found at {studio} (set HUASHU_MOTION_DIR)")
    ok = patch(os.path.join(studio, "index.html"), HTML, check)
    ok &= patch(os.path.join(studio, "studio.js"), JS, check)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
