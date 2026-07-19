# -*- coding: utf-8 -*-
"""生成《AI 问书 · 研发同步改动清单》xlsx（开会用，带页面截图）。

组织方式：**按功能模块**，不按端拆——「KP 下架」这一件事在机构后台和读者端分别是什么表现，
写在同一个功能点里，跨端的产品逻辑一次讲透。

正文内容在 docs/change-list-build/content.py（改文案只动那个文件）。
配图由 docs/change-list-build/shoot-changes.cjs 打线上截取。
跑法：<venv>/bin/python docs/gen-change-list-xlsx.py
"""
import math
import os
import sys

import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.drawing.image import Image as XLImage
from openpyxl.cell.rich_text import CellRichText, TextBlock
from openpyxl.cell.text import InlineFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "AI问书-研发同步改动清单.xlsx")
SHOTS = os.path.join(HERE, "change-list-assets")
sys.path.insert(0, os.path.join(HERE, "change-list-build"))
from content import ITEMS  # noqa: E402

HEAD_FILL = PatternFill("solid", fgColor="4B57E8")
HEAD_FONT = Font(bold=True, color="FFFFFF", size=11)
MOD_FILL = PatternFill("solid", fgColor="EEF0FF")
WARN_FILL = PatternFill("solid", fgColor="FFF7ED")
THIN = Side(style="thin", color="DDDDDD")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")
CTR = Alignment(horizontal="center", vertical="center")
CTR_WRAP = Alignment(horizontal="center", vertical="center", wrap_text=True)
BOLD = Font(bold=True, size=10)
BODY = Font(size=10)
RED = Font(color="DC2626", size=10)

DESC_COL_CHARS = 36   # 改动说明列一行大约放得下多少个汉字（按列宽 72 估）
IMG_H = 150           # 行内配图高度 px


def ensure_tiers():
    """从原图派生两档压缩图（缺失或过期才重生成）。

    xlsx 嵌图保留的是原始文件字节、与显示尺寸无关：直接嵌 2x 原图会让文件涨到 18MB，
    压过之后 4~5MB。thumbs 供行内缩略、large 供「页面大图」页放大看。
    """
    import glob
    try:
        from PIL import Image
    except ImportError:
        print("⚠ 未安装 pillow，跳过压缩、直接用原图（xlsx 会偏大）")
        return
    for sub, cap in (("thumbs", 900), ("large", 1600)):
        d = os.path.join(SHOTS, sub)
        os.makedirs(d, exist_ok=True)
        for src in sorted(glob.glob(os.path.join(SHOTS, "*.png"))):
            dst = os.path.join(d, os.path.basename(src))
            if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
                continue
            im = Image.open(src).copy()
            im.thumbnail((cap, cap), Image.LANCZOS)
            im.convert("P", palette=Image.ADAPTIVE, colors=256).save(dst, optimize=True)


ensure_tiers()
wb = openpyxl.Workbook()


def head(ws, header, widths):
    ws.append(header)
    for c in range(1, len(header) + 1):
        cell = ws.cell(row=1, column=c)
        cell.fill, cell.font, cell.border, cell.alignment = HEAD_FILL, HEAD_FONT, BORDER, CTR
    for i, w in enumerate(widths):
        ws.column_dimensions[chr(65 + i)].width = w
    ws.freeze_panes = "A2"


def put_shot(ws, row, col_letter, fname, px_h, tier="thumbs"):
    p = os.path.join(SHOTS, tier, fname)
    if not os.path.exists(p):
        p = os.path.join(SHOTS, fname)
    if not os.path.exists(p):
        return False
    img = XLImage(p)
    ratio = img.width / img.height
    img.height = px_h
    img.width = int(px_h * ratio)
    img.anchor = f"{col_letter}{row}"
    ws.add_image(img)
    return True


def est_lines(text, per_line):
    """估算换行后占几行，用来定行高。**标记不占宽度，先剥掉再算。"""
    plain = text.replace("**", "")
    return sum(max(1, math.ceil(len(seg) / per_line)) for seg in plain.split("\n"))


def rich(text, size=10):
    """把 `**加粗**` 标记转成 Excel 富文本。

    Excel 单元格不认 Markdown，直接写 ** 会原样显示成星号。正文用 ** 标重点很方便，
    所以在写入时统一转成真正的加粗片段。无 ** 时原样返回字符串（省开销）。
    """
    if "**" not in text:
        return text
    parts = text.split("**")
    blocks = []
    for i, seg in enumerate(parts):
        if not seg:
            continue
        if i % 2:                                   # 奇数段＝被 ** 包住的部分
            blocks.append(TextBlock(InlineFont(b=True, sz=size), seg))
        else:
            blocks.append(TextBlock(InlineFont(sz=size), seg))
    return CellRichText(*blocks)


# ══════════════════════════════════════════════════════════════════
# 总览
# ══════════════════════════════════════════════════════════════════
ws = wb.active
ws.title = "总览"
ws.append(["项", "内容"])
for c in (1, 2):
    ws.cell(row=1, column=c).fill = HEAD_FILL
    ws.cell(row=1, column=c).font = HEAD_FONT
    ws.cell(row=1, column=c).border = BORDER
    ws.cell(row=1, column=c).alignment = CTR

mods = []
for m, *_ in ITEMS:
    if m not in mods:
        mods.append(m)

OVER = [
    ("这份清单干什么用",
     "告诉研发和测试同学：这个项目现在有哪些功能被改了、改成什么样了。"
     "研发手上的 GitHub 代码停在 6 月 17 日，之后我根据大家在开发测试中反馈的问题陆续改了七批。"),
    ("怎么读",
     "主体是「改动说明」这一页，按功能模块组织。一个功能点用一段话讲完它现在的完整产品逻辑，"
     "① ② ③ 逐条列出各端分别是什么表现，后面配对应页面的截图。"
     "带 ⚠️ 的是**和你们手上 PRD 结论相反**的地方，最容易做返工，请重点看。"),
    ("模块划分", " / ".join(mods)),
    ("涉及范围", "移动端 H5（读者用）、机构后台（出版社运营用）、平台超管（我们自己用）三端都有改动。"),
    ("配套文档",
     "产品 PRD 已升到 v1.10、功能清单 v2.7、品牌色影响清单 95 条，都已同步到飞书线上，改动处标了红色。"),
    ("", ""),
    ("⚠️ 拉代码提醒",
     "这次改动跨了多个代码包。只拉页面目录会出现样式全丢、功能报错——请整个仓库一起同步。"),
    ("⚠️ 端口变了",
     "移动端本地开发端口从 5173 改成 5170（5173 被其他项目占着）。联调文档和自动化脚本要一起改。"),
    ("", ""),
    ("七个批次分别做了什么", ""),
    ("0712", "父子机构关系理顺、指标口径分类、知识产品前台地址改成真实域名"),
    ("0714", "导出体系规范化、命名统一「机构」、订阅删除加护栏"),
    ("0715", "数据看板留存率按注册批次重做、权限联动、订单双筛选"),
    ("0716", "知识产品状态机四态并三态、订单支付成功才落库、导出上限"),
    ("0717", "知识产品状态语义定稿、新增前台判活入口、会员开通页双模式"),
    ("0718", "会员价格按购买方式分组、纸书标签体系定稿、留存口径精修"),
    ("0719", "会员开通页协议改为默认不勾选（合规）"),
]
r = 2
for k, v in OVER:
    ws.cell(row=r, column=1, value=k).border = BORDER
    ws.cell(row=r, column=2, value=rich(v)).border = BORDER
    ws.cell(row=r, column=1).alignment = WRAP
    ws.cell(row=r, column=2).alignment = WRAP
    ws.cell(row=r, column=1).font = RED if k.startswith("⚠️") else BOLD
    ws.cell(row=r, column=2).font = BODY
    ws.row_dimensions[r].height = max(16, est_lines(v, 60) * 14)
    r += 1
ws.column_dimensions["A"].width = 22
ws.column_dimensions["B"].width = 112
ws.freeze_panes = "A2"

# ══════════════════════════════════════════════════════════════════
# 改动说明（主体，按模块分组）
# ══════════════════════════════════════════════════════════════════
ws = wb.create_sheet("改动说明")
head(ws, ["模块", "功能点", "改动说明", "影响端", "配图 1", "配图 2", "配图 3"],
     [14, 22, 72, 14, 30, 30, 30])
r = 2
last_mod = None
for mod, feat, desc, ends, shots in ITEMS:
    if mod != last_mod:                                  # 模块分隔条
        ws.cell(row=r, column=1, value=f"■ {mod}")
        for c in range(1, 8):
            ws.cell(row=r, column=c).fill = MOD_FILL
            ws.cell(row=r, column=c).font = Font(bold=True, size=11, color="3942C9")
            ws.cell(row=r, column=c).border = BORDER
        ws.row_dimensions[r].height = 22
        r += 1
        last_mod = mod
    for c, v in enumerate([mod, feat, rich(desc), ends], start=1):
        cell = ws.cell(row=r, column=c, value=v)
        cell.border, cell.alignment, cell.font = BORDER, WRAP, BODY
    ws.cell(row=r, column=2).font = BOLD
    ws.cell(row=r, column=4).alignment = CTR_WRAP
    for c in (5, 6, 7):
        ws.cell(row=r, column=c).border = BORDER
    if "⚠️" in desc:                                     # 含反转结论的整行淡橙
        for c in range(1, 8):
            ws.cell(row=r, column=c).fill = WARN_FILL
    for i, s in enumerate(shots[:3]):
        put_shot(ws, r, chr(69 + i), s, IMG_H)
    ws.row_dimensions[r].height = max(est_lines(desc, DESC_COL_CHARS) * 14.5, IMG_H * 0.78)
    r += 1

# ══════════════════════════════════════════════════════════════════
# 测试要注意
# ══════════════════════════════════════════════════════════════════
ws = wb.create_sheet("测试要注意")
head(ws, ["#", "容易踩的坑", "说明"], [5, 30, 96])
TEST = [
    ("1", "先清浏览器缓存再测", "知识产品状态、机构层级这两样会存在浏览器本地，上一轮测出来的状态会带到下一轮，导致结果对不上。"),
    ("2", "状态按钮只有一个，不是两个", "草稿只有「发布」、已发布只有「下架」。按按钮文字去点的自动化脚本要全改。"),
    ("3", "「删了还能不能找回」的预期变了", "界面上找不回，但数据库里全都在。别按「彻底删掉」去验收。"),
    ("4", "买断的内容在下架期间也看不了", "这是这次定的规则，不是 bug。"),
    ("5", "共享的知识产品「能看不能改」是对的", "数据正常显示、能查能搜，只有操作按钮是灰的。别当成权限漏做了。"),
    ("6", "留存那段和上面的时间筛选互不影响", "这是设计。切时间筛选留存卡不动，切注册批次上面的数字不动。"),
    ("7", "「尚未到统计时间」不是显示异常", "留存要等满 N 天才有数，没到就明说没到，不显示 0%。"),
    ("8", "导出超限只有一个地方能测出来", "平台超管 → 全域用户 → 什么筛选都不加 → 导出。别的页面数据量不够触发不了。"),
    ("9", "订单按兑换时间筛选会把普通订单筛掉", "非兑换码订单本来就没有兑换时间，这是预期行为。"),
    ("10", "环比标签里的日期每天都在变", "它是按当前系统时间算的。拿截图做基线对比的回归会一直报差异。"),
    ("11", "会员开通按钮是灰的但仍然能点", "靠点击后弹提示来拦，不是把按钮禁用。自动化脚本别去断言 disabled。"),
    ("12", "移动端端口改成 5170", "原来的 5173 被其他项目占了。"),
]
r = 2
for num, k, v in TEST:
    for c, val in enumerate([num, k, rich(v)], start=1):
        cell = ws.cell(row=r, column=c, value=val)
        cell.border, cell.alignment, cell.font = BORDER, WRAP, BODY
    ws.cell(row=r, column=2).font = BOLD
    ws.row_dimensions[r].height = max(16, est_lines(v, 48) * 14)
    r += 1

# ══════════════════════════════════════════════════════════════════
# 待办与待拍板
# ══════════════════════════════════════════════════════════════════
ws = wb.create_sheet("待办与待拍板")
head(ws, ["类别", "事项", "说明", "谁来定"], [14, 28, 80, 12])
TODO = [
    ("代码待修", "导出文件里的口径说明写错了",
     "数据看板导出的 Excel 里，日活/周活/月活那几行还写着「不随时间区间变化」，"
     "但数值其实是按当前筛选区间取的。这个文件是会发给客户的，优先修。", "研发"),
    ("代码待修", "平台后台删除弹窗的人数是写死的",
     "不管删哪本书都显示「128 位已购用户」，和机构后台同一本书的数字对不上。", "研发"),
    ("代码待修", "有段代码注释和实现相反",
     "注释还写着「会真删」，实际实现是只做标记不真删。后端照注释写就错了。", "研发"),
    ("待确认", "答案反馈页的时间筛选不生效",
     "选了时间列表不过滤，只影响导出文件里记录的筛选条件。和订单页的行为不一致。", "产品"),
    ("待确认", "机构详情改域名前缀不查重",
     "新建机构时会查重复，详情页改的时候不查。", "产品"),
    ("上线前清理", "兑换码页面的演示提示要删掉",
     "现在页面上写着「演示码：FUTURE / EXPIRED / STOPPED」，上线前必须去掉。", "研发"),
    ("待拍板", "平台主控台选单个机构时，「入驻机构数」该不该变",
     "现在是选了机构只换标题、数字不变。这涉及产品定义，没敢擅自改。", "产品"),
    ("待拍板", "品牌色和会员价值色会打架",
     "会员、永享这套权益色现在全压在橙色系上，而暖橙恰好是出版社最爱选的品牌色。"
     "机构要是选了个橙色，「开通会员」按钮和品牌主按钮会糊成一片分不出来。"
     "要么限制可选色范围，要么给会员体系一个固定的、不跟品牌走的颜色。", "产品+设计"),
    ("工程债", "品牌色不是「换个变量就能改」",
     "现在有几十处颜色是直接写死在代码里的，改变量它们不会跟着变。"
     "真要做机构自定义品牌色，得先花一轮把这些收敛掉。", "研发"),
]
r = 2
for cat, item, desc, owner in TODO:
    for c, v in enumerate([cat, item, rich(desc), owner], start=1):
        cell = ws.cell(row=r, column=c, value=v)
        cell.border, cell.alignment, cell.font = BORDER, WRAP, BODY
    ws.cell(row=r, column=2).font = BOLD
    ws.row_dimensions[r].height = max(16, est_lines(desc, 40) * 14)
    r += 1

# ══════════════════════════════════════════════════════════════════
# 技术附录
# ══════════════════════════════════════════════════════════════════
ws = wb.create_sheet("技术附录")
head(ws, ["类别", "内容", "原先", "之后", "后端要做什么"], [16, 26, 30, 40, 40])
TECH = [
    ("说明", "本页是给研发看的技术细节", "", "",
     "前面几页讲产品逻辑，这页讲字段和接口。开会可以跳过，研发同学单独看。"),
    ("状态枚举", "知识产品状态", "draft / published / archived",
     "draft / published / unlisted / deleted",
     "枚举扩容；原 archived 的历史数据要迁成 deleted；不要实现物理删除"),
    ("新增字段", "知识产品 · 分享方式", "无", "realtime（实时同步）/ snapshot（独立快照），可空表示自建",
     "新增列。决定能不能编辑、配额怎么扣、二维码和分享页是否可见"),
    ("新增字段", "机构 · 域名前缀", "无", "字符串，全平台唯一", "新增列 + 唯一约束"),
    ("新增字段", "机构 · 上级机构", "无", "可空外键，只允许两层", "新增列 + 防成环校验"),
    ("新增字段", "机构 · 套餐", "无", "基础版/专业版/旗舰版/定制版", "新增列"),
    ("口径变更", "配额分两种算法", "三项配额都按月累计",
     "知识产品数、存储＝占用型（实时算当前占了多少，删了能释放，跨周期延续）；"
     "Token＝消耗型（绑当前订阅周期，换周期归零，不可回收）",
     "Token 用量要按订阅周期分桶存，换周期时归零；知识产品和存储改成对当前资源实时聚合"),
    ("口径变更", "订阅的 Token 额度", "月度 Token", "当前订阅周期 Token", "从按自然月重置改为按订阅周期重置"),
    ("新增字段", "C 端用户 · 注册时间", "无", "datetime", "新增列，两个后台列表要能按它排序"),
    ("新增字段", "兑换码批次 · 可兑换时间", "无", "起止两个时间字段", "新增两列。注意这和「权益有效期」是两个概念"),
    ("新增字段", "订单 · 退款记录", "无", "数组，一单可多笔", "新增关联表，每笔含退款单号、金额、状态、申请时间"),
    ("接口要求", "按 ID 查知识产品", "查不到就 404", "已删除的也要能查到并返回 deleted 状态",
     "软删的不能返 404，否则前台区分不出「已失效」和「链接错了」"),
    ("接口要求", "取机构最新已发布的知识产品", "无此接口", "按机构 ID 取最新一本已发布的", "前台判活页跳转要用"),
    ("接口要求", "兑换码失败要分类型", "只返回成功/失败",
     "要能区分：未到生效时间（带具体时间）/ 已过期 / 机构已停用", "前台按类型给不同提示"),
    ("接口要求", "会员商品要分两种", "一个价格字段", "连续包月（签约代扣）和单月（一次性）是两种商品",
     "不能用一个价格字段表达"),
    ("业务规则", "退款和权益的关系", "未定义",
     "只有「全额退款」且「该订单是这个权益的唯一来源」才收回权益，其余一律保留", "部分退款不收回权益"),
    ("业务规则", "分享的两种模式怎么算配额", "未定义",
     "实时同步：只烧接收方 Token，不占接收方配额，只读，撤销后立即失去访问；"
     "独立快照：占接收方配额，可编辑，撤销后仍可访问", "按模式分支扣配额"),
    ("业务规则", "登录态有效期", "固定 30 天", "滑动 7 天：每次有效操作刷新，连续 7 天没动作才失效", "改成滑动过期"),
    ("工程约束", "导出相关代码不能引入前端依赖", "无此约束",
     "导出逻辑要能被 node 直接跑（不能 import react / 浏览器 API）",
     "破坏这个约束会让导出模板生成脚本直接挂掉"),
]
r = 2
for row in TECH:
    for c, v in enumerate(row, start=1):
        cell = ws.cell(row=r, column=c, value=rich(v))
        cell.border, cell.alignment, cell.font = BORDER, WRAP, BODY
    if row[0] == "说明":
        for c in range(1, 6):
            ws.cell(row=r, column=c).fill = MOD_FILL
    ws.row_dimensions[r].height = max(16, est_lines(row[3], 20) * 14)
    r += 1

# ══════════════════════════════════════════════════════════════════
# 页面大图
# ══════════════════════════════════════════════════════════════════
ws = wb.create_sheet("页面大图")
ws.append(["页面", "截图（可放大看细节）"])
for c in (1, 2):
    ws.cell(row=1, column=c).fill = HEAD_FILL
    ws.cell(row=1, column=c).font = HEAD_FONT
    ws.cell(row=1, column=c).border = BORDER
    ws.cell(row=1, column=c).alignment = CTR
GALLERY = [
    ("移动端 · 开通会员（双模式 + 协议默认不勾）", "h5-member.png", 620),
    ("移动端 · 扫码判活页（已下架）", "h5-kpgate-off.png", 620),
    ("移动端 · 扫码判活页（已失效）", "h5-kpgate-dead.png", 620),
    ("移动端 · 我的纸书（双标 + 整卡变淡）", "h5-books.png", 620),
    ("移动端 · 我的永享", "h5-yongxiang.png", 620),
    ("移动端 · 我的订单（双维度筛选 + 退款条）", "h5-orders.png", 620),
    ("移动端 · 兑换码", "h5-redeem.png", 620),
    ("机构后台 · 知识产品列表", "org-kps.png", 400),
    ("机构后台 · 知识产品详情", "org-kpdetail.png", 400),
    ("机构后台 · 数据看板（留存三卡 + 区间分析）", "org-board.png", 400),
    ("机构后台 · 系统配置（会员价格三档）", "org-sys.png", 400),
    ("机构后台 · 订单管理", "org-orders.png", 400),
    ("机构后台 · 兑换码", "org-codes.png", 400),
    ("平台超管 · 机构管理", "plat-orgs.png", 400),
    ("平台超管 · 机构详情", "plat-orgdetail.png", 400),
    ("平台超管 · 全域知识产品", "plat-globalkps.png", 400),
    ("平台超管 · 角色权限", "plat-roles.png", 400),
    ("平台超管 · 全域用户", "plat-users.png", 400),
]
ws.column_dimensions["A"].width = 42
ws.column_dimensions["B"].width = 92
r = 2
for label, fname, h in GALLERY:
    cell = ws.cell(row=r, column=1, value=label)
    cell.border, cell.alignment, cell.font = BORDER, WRAP, BOLD
    ws.cell(row=r, column=2).border = BORDER
    put_shot(ws, r, "B", fname, h, tier="large")
    ws.row_dimensions[r].height = h * 0.78
    r += 1
ws.freeze_panes = "A2"

wb.save(OUT)
n_items = len(ITEMS)
n_mods = len(mods)
print(f"✅ 已生成 {OUT}")
print(f"   {n_mods} 个模块 / {n_items} 个功能点 / {len(wb.sheetnames)} 个 sheet")
