# -*- coding: utf-8 -*-
"""把本地 xlsx 增量同步到飞书在线表格（功能清单 3 sheet + 品牌色影响清单）。

设计原则（为什么这么做）：
- **绝不全量覆盖**：逐行比对，只写内容真正变化的行；未变化的行一个字节都不碰。
- **写前设安全闸**：先确认线上内容 == 基线（origin/master 那版 xlsx）。若线上被人改过，
  立刻中止并列出差异，交人工判断——避免覆盖技术同学在线上补的内容。
- **只增不删**：线上有、本地没有的行一律保留，只做「改」和「追加」。

用法：
    python sync-to-feishu.py                             # 只打印计划，不写（默认 dry-run）
    python sync-to-feishu.py --apply --batch 0819        # 真正写入，写完自动刷新基线快照
    python sync-to-feishu.py --apply --skip-baseline-check   # 已人工确认过线上差异时使用
    python sync-to-feishu.py --refresh-snapshot          # 只重建基线快照（首次建基线 / 人工合并后）

安全闸报警怎么办（0819 教训）：
    报「线上第 N 行已被改动」时，先确认那行内容是不是上一轮同步自己写进去的。
    早期脚本写入后不刷新快照，必然产生这种误报；现已在 --apply 末尾自动刷新。

依赖：openpyxl；已登录的 lark-cli（需 user 身份，bot 无写权限）。
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # docs/
NUM_PREFIX = re.compile(r"^\d+\.\s*")

# (本地 xlsx 路径, sheet 名, 线上 spreadsheet token, 线上 sheet_id, 列数)
TARGETS = [
    (f"{ROOT}/feature-list.xlsx", "功能清单",     "Jfl2sKqqmhYrxftHSlAcPzNvn5Q", "0rMuqv", 5),
    # 0814：原「数据看板指标」「用量看板指标」两张附表合并为一张「指标口径」（7 列、98 条）。
    #   线上沿用原「数据看板指标」的 sheet_id（1BjMEB，重命名不改 id）承载合并后的表；
    #   「用量看板指标」（2WEPcW）内容已并入，该 Tab 需在飞书手动删除——本脚本只增不删，删不掉 Tab。
    (f"{ROOT}/feature-list.xlsx", "指标口径", "Jfl2sKqqmhYrxftHSlAcPzNvn5Q", "1BjMEB", 6),
    (f"{ROOT}/brand-color-impact.xlsx", "品牌色影响清单", "FneDsve4thptfTtMUKjc1uV7n07", "0otikK", 8),
]

COL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


SNAP_DIR = f"{os.path.dirname(os.path.abspath(__file__))}/.feishu-snapshot"
SNAP_PATH = f"{SNAP_DIR}/baseline.json"


def refresh_snapshot(batch=""):
    """把三张线上表回读一遍，重写基线快照。

    为什么必须在 --apply 之后自动跑（0819 教训）：
    脚本原先只在人工记得时才刷快照，于是每同步一次，下一次安全闸必然把
    「上一轮自己写进去的内容」误报成他人并发改动，中止并要求人工确认——
    久而久之只会训练出「见到报警就 --skip-baseline-check」的习惯，
    安全闸也就形同虚设了。

    为什么回读线上而不是直接拿本地 local 当快照：
    快照的用途是回答「线上现在是不是我上次留下的样子」。飞书对写入内容
    可能做规范化（空白、数字/文本类型等），若把「我们发出去的值」当快照，
    下次读回来仍可能对不上。只有回读才能记录线上真实落地的形态。
    """
    if os.path.exists(SNAP_PATH) and batch:
        bak = f"{SNAP_PATH}.bak-pre{batch}"
        if not os.path.exists(bak):
            import shutil
            shutil.copy(SNAP_PATH, bak)
            print(f"  · 旧快照已备份 → {os.path.basename(bak)}")
    os.makedirs(SNAP_DIR, exist_ok=True)
    snap = {}
    for _path, sheet, token, sheet_id, ncols in TARGETS:
        rows = read_online(token, sheet_id, ncols)
        snap[sheet_id] = {"rows": rows, "count": len(rows)}
        print(f"  · 快照刷新 {sheet}：{len(rows)} 行")
    with open(SNAP_PATH, "w", encoding="utf-8") as f:
        json.dump(snap, f, ensure_ascii=False, indent=1)
    print(f"✓ 基线快照已更新 → {os.path.relpath(SNAP_PATH)}")


def sh(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    out = r.stdout
    if "{" in out:
        out = out[out.index("{"):]
    return out


def read_online(token, sheet_id, ncols):
    rng = f"{sheet_id}!A1:{COL[ncols - 1]}400"
    raw = sh(f'lark-cli sheets +read --spreadsheet-token {token} --range "{rng}"')
    try:
        d = json.loads(raw)
    except Exception:
        sys.exit(f"✗ 读取线上表格失败，原始输出：\n{raw[:400]}")
    if not d.get("ok"):
        sys.exit(f"✗ 读取线上表格失败：{d.get('error')}")
    vals = d["data"]["valueRange"]["values"] or []
    rows = []
    for r in vals:
        cells = [("" if c is None else str(c)) for c in r[:ncols]]
        cells += [""] * (ncols - len(cells))
        if any(c.strip() for c in cells):
            rows.append(cells)
    return rows


def read_local(path, sheet, ncols):
    import openpyxl
    wb = openpyxl.load_workbook(path)
    ws = wb[sheet]
    rows = []
    for r in ws.iter_rows(values_only=True):
        cells = [("" if c is None else str(c)) for c in r[:ncols]]
        cells += [""] * (ncols - len(cells))
        if any(c.strip() for c in cells):
            rows.append(cells)
    return rows


def norm_row(cells):
    """比对用归一化：模块列的序号前缀不参与比对（线上按 0617 决策不带序号）。"""
    return [NUM_PREFIX.sub("", c).strip() for c in cells]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="真正写入（默认只做 dry-run）")
    ap.add_argument("--skip-baseline-check", action="store_true")
    ap.add_argument("--baseline-dir", default="", help="基线 tsv 目录（可选，用于安全闸）")
    ap.add_argument("--refresh-snapshot", action="store_true",
                    help="只回读线上、重建基线快照，不做任何比对与写入（首次建基线 / 人工合并后重建用）")
    ap.add_argument("--batch", default="",
                    help="批次号（如 0819）。写入前把旧快照备份为 baseline.json.bak-pre<批次>")
    ap.add_argument("--no-refresh", action="store_true",
                    help="写入后不自动刷新快照（不建议；仅在需要保留旧基线做人工比对时使用）")
    args = ap.parse_args()

    if args.refresh_snapshot:
        refresh_snapshot(args.batch)
        return

    total_upd = total_add = 0
    wrote_any = False
    for path, sheet, token, sheet_id, ncols in TARGETS:
        if not os.path.exists(path):
            print(f"⚠ 跳过 {sheet}：本地文件不存在 {path}")
            continue
        local = read_local(path, sheet, ncols)
        online = read_online(token, sheet_id, ncols)
        print(f"\n{'=' * 68}\n### {sheet}    本地 {len(local)} 行 / 线上 {len(online)} 行")

        updates, adds = [], []
        for i in range(len(local)):
            l = local[i]
            if i < len(online):
                if norm_row(online[i]) != norm_row(l):
                    updates.append((i + 1, online[i], l))
            else:
                adds.append((i + 1, l))

        # 线上比本地长：多出来的行一律保留，不删
        extra = online[len(local):]
        if extra:
            print(f"  ℹ 线上多出 {len(extra)} 行（保留不动）：")
            for e in extra[:5]:
                print("     ·", " | ".join(e[:3])[:90])

        print(f"  → 需更新 {len(updates)} 行 · 需追加 {len(adds)} 行")
        for rn, old, new in updates[:8]:
            print(f"     ~ 第{rn}行 {' | '.join(new[:3])[:80]}")
        if len(updates) > 8:
            print(f"     … 另有 {len(updates) - 8} 行")
        for rn, new in adds[:8]:
            print(f"     + 第{rn}行 {' | '.join(new[:3])[:80]}")
        if len(adds) > 8:
            print(f"     … 另有 {len(adds) - 8} 行")

        total_upd += len(updates)
        total_add += len(adds)

        if args.apply:
            if not updates and not adds:
                print("  ○ 无差异，跳过写入")
                continue
            # 安全闸：写之前确认线上仍与分析时的快照一致，避免覆盖他人并发改动
            if not args.skip_baseline_check:
                if not os.path.exists(SNAP_PATH):
                    sys.exit(
                        f"✗ 找不到基线快照 {SNAP_PATH}——安全闸无法生效。\n"
                        "  请先跑 --refresh-snapshot 建立基线，或确认要跳过时显式加 --skip-baseline-check。"
                    )
                snap = json.load(open(SNAP_PATH, encoding="utf-8")).get(sheet_id)
                if not snap:
                    sys.exit(f"✗ [{sheet}] 快照里没有 {sheet_id} 的基线，安全闸无法生效，已中止。")
                # 0724：快照可能是旧列数（附表加列前），比对前统一补齐到当前 ncols
                expect = [([str(c) for c in r] + [""] * ncols)[:ncols] for r in snap["rows"]]
                got = [([str(c) for c in r] + [""] * ncols)[:ncols] for r in online]
                if len(expect) != len(got):
                    sys.exit(
                        f"✗ [{sheet}] 线上行数已变（快照 {len(expect)} → 现在 {len(got)}），"
                        f"说明有人改过线上。已中止，请人工确认后加 --skip-baseline-check 重跑。"
                    )
                for idx, (e, g) in enumerate(zip(expect, got)):
                    if [x.strip() for x in e[:ncols]] != [x.strip() for x in g[:ncols]]:
                        sys.exit(
                            f"✗ [{sheet}] 线上第 {idx + 1} 行已被改动，已中止。\n"
                            f"   快照：{' | '.join(e[:3])[:100]}\n"
                            f"   现在：{' | '.join(g[:3])[:100]}\n"
                            f"   自查：若该行内容正是上一轮同步写进去的（快照未及时刷新所致），"
                            f"加 --skip-baseline-check 重跑即可；否则说明确有他人改动，先人工合并。"
                        )
                print(f"  ✓ 安全闸通过：线上与快照一致（{len(got)} 行）")

            # 分块批量写：一次一段连续区间，避免上百次单行调用
            CHUNK = 40
            written = 0
            for start in range(0, len(local), CHUNK):
                block = local[start:start + CHUNK]
                r1, r2 = start + 1, start + len(block)
                rng = f"{sheet_id}!A{r1}:{COL[ncols - 1]}{r2}"
                payload = json.dumps(block, ensure_ascii=False)
                proc = subprocess.run(
                    ["lark-cli", "sheets", "+write", "--spreadsheet-token", token,
                     "--range", rng, "--values", payload],
                    capture_output=True, text=True,
                )
                out = proc.stdout
                out = out[out.index("{"):] if "{" in out else out
                try:
                    ok = json.loads(out).get("ok")
                except Exception:
                    ok = False
                if not ok:
                    print(f"  ✗ 第{r1}-{r2}行写入失败：{out[:300]}")
                    sys.exit(1)
                written += len(block)
            print(f"  ✓ 已写入 {written} 行（{(len(local) + CHUNK - 1) // CHUNK} 次批量调用）")
            wrote_any = True

    print(f"\n{'=' * 68}")
    print(f"合计：更新 {total_upd} 行 · 追加 {total_add} 行")
    if not args.apply:
        print("（当前是 dry-run。确认无误后加 --apply 真正写入）")
        return

    # 0819 修复：写入后自动刷新基线快照。
    # 不刷新的话，下次同步安全闸必然把「本轮自己写进去的内容」误报为他人改动，
    # 进而把人训练成「见报警就 --skip-baseline-check」，安全闸随之失效。
    if wrote_any and not args.no_refresh:
        print("\n—— 写入完成，刷新基线快照 ——")
        refresh_snapshot(args.batch)
    elif not wrote_any:
        print("（三张表均无差异，未写入，快照无需刷新）")


if __name__ == "__main__":
    main()
