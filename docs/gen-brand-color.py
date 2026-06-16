# -*- coding: utf-8 -*-
"""生成「机构品牌色影响范围」详版清单 xlsx（用 venv python 跑：docs/feature-list-build/.venv/bin/python）。
口径：从 UX / 产品 / UI 设计角度，穷尽机构前台 H5 + 机构后台 PC 哪些随机构品牌色变、哪些不变。
现状：平台超管·机构详情·品牌外观 可配主色/辅色，但前台/后台暂无代码消费(全硬编码 --indigo)，本表是规格 + 技术落地清单。
"""
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

H = ['序号', '端', '页面 / 模块', '位置 / 元素', '色用法', '是否随品牌色变', '当前实现', '建议变量 / 说明']

# (端, 页面, 位置, 色用法, 是否随品牌变, 当前实现, 建议/说明)
ROWS = [
    # —— 机构前台 H5 · 需随品牌色变 ——
    ['机构前台 H5', '登录落地页', '手机号登录按钮', '主色填充', '✅ 需变', '硬编码 indigo', '--org-primary'],
    ['机构前台 H5', '登录落地页', '知识核动效球', '主→辅渐变', '✅ 需变', '硬编码', '--org-grad'],
    ['机构前台 H5', '登录落地页', '「问书」渐变标题', '主→辅渐变文字', '✅ 需变', '--grad', '--org-grad'],
    ['机构前台 H5', '手机验证码登录', '获取验证码 / 登录按钮', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构前台 H5', 'AI 会话', '发送按钮', '主色填充', '✅ 需变', '--indigo', '--org-primary'],
    ['机构前台 H5', 'AI 会话', '能力开关选中态(深度思考/智能搜索)', '主色软底 + 主色字', '✅ 需变', 'indigo 软底', '--org-primary / -soft'],
    ['机构前台 H5', 'AI 会话', '语音输入音浪动画', '主色', '✅ 需变', '硬编码', '--org-primary'],
    ['机构前台 H5', 'AI 会话', '视频/音频播放进度条', '主色填充', '✅ 需变', '--indigo', '--org-primary'],
    ['机构前台 H5', 'AI 会话', '推荐追问 / 可点链接', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构前台 H5', 'AI 会话', '音频封面渐变底', '主→辅渐变', '✅ 需变', '硬编码', '--org-grad'],
    ['机构前台 H5', 'AI 会话', '欢迎态「全库检索」说明 chip', '主色淡底 + 主色字', '✅ 需变', 'indigo-soft', '--org-primary / -soft'],
    ['机构前台 H5', '多模态付费墙', '永享买断按钮', '主色 / 价值色', '✅ 需变', 'btn-amber', '--org-primary（按钮主色随品牌）'],
    ['机构前台 H5', '会员中心', '会员卡光球', '主色', '✅ 需变', '硬编码', '--org-primary'],
    ['机构前台 H5', '会员中心', '开通会员主按钮', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构前台 H5', '微信支付收银台', '顶部 logo 动画球', '主→辅渐变', '✅ 需变', '硬编码', '--org-grad'],
    ['机构前台 H5', '支付成功页', '成功对勾同心圆光环', '主色', '✅ 需变', '硬编码', '--org-primary'],
    ['机构前台 H5', '我的纸书', 'KP 封面渐变底', '主→辅渐变', '✅ 需变', '硬编码', '--org-grad'],
    ['机构前台 H5', '我的 / 个人中心', '用户卡 / 会员标强调', '主色', '✅ 需变', '硬编码', '--org-primary'],
    ['机构前台 H5', '兑换码', '立即兑换按钮', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构前台 H5', '全局', '主按钮 / 选中态 / 单选复选勾选', '主色', '✅ 需变', '--indigo', '--org-primary'],
    # —— 机构后台 PC · 需随品牌色变 ——
    ['机构后台 PC', '登录页', '登录按钮', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构后台 PC', '登录页', '左侧品牌区 blob / 知识核', '主→辅渐变', '✅ 需变', '硬编码', '--org-grad'],
    ['机构后台 PC', '全局·侧栏', '菜单激活态(左竖条+底色+文字)', '主色', '✅ 需变', '--side-active / --indigo', '--org-primary'],
    ['机构后台 PC', '全局', '主操作按钮(新建/保存/导出)', '主色填充', '✅ 需变', '--indigo', '--org-primary'],
    ['机构后台 PC', '全局', 'Tab 选中下划线', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构后台 PC', '全局', '链接 / 可点文字', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构后台 PC', '全局', '开关 / 单选 / 复选 选中态', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构后台 PC', '全局', '输入框聚焦边框', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构后台 PC', '全局', '进度条 / 配额条填充', '主色', '✅ 需变', '--indigo', '--org-primary'],
    ['机构后台 PC', '主控台', '趋势图 / KPI 图表主色系', '主色系', '✅ 需变', 'Recharts 硬编码', '--org-primary'],
    ['机构后台 PC', '主控台', '当前订阅卡强调 / 徽标', '主色', '✅ 需变', '硬编码', '--org-primary'],
    ['机构后台 PC', '数据看板', '留存/来源/分布等图表主色系', '主色系', '✅ 需变', 'Recharts 硬编码', '--org-primary'],
    ['机构后台 PC', '数据看板', '提问关键词云·色深', '主色系', '✅ 需变', '硬编码', '--org-primary'],
    # —— 不随品牌色变（保持固定，重要！）——
    ['三端通用', '全局', '成功 / 已解锁 / 上架 标识', '语义成功绿', '❌ 不需变', '--jade', '语义色固定——变了会失去「成功」直觉'],
    ['三端通用', '全局', '删除 / 危险 / 错误 / 退款', '语义错误红', '❌ 不需变', '--terra', '语义色固定——警示性不能被品牌色稀释'],
    ['机构前台 H5', '登录 / 支付', '微信登录 · 微信支付 按钮', '微信品牌绿', '❌ 不需变', '微信绿', '微信官方品牌色，识别度与合规要求，不可改'],
    ['三端通用', '全局', '正文 / 标题 文字', '中性墨色', '❌ 不需变', '--ink / --ink-2', '中性色，保证可读性，品牌色只做点缀不做正文'],
    ['三端通用', '全局', '页面 / 卡片 背景', '奶白 / 白', '❌ 不需变', '--surface / --paper', '中性底；品牌色仅用于强调，不做大面积背景'],
    ['三端通用', '全局', '边框 / 分隔线', '中性灰', '❌ 不需变', '--line / --line-2', '中性结构色，跨机构统一'],
    ['机构前台 H5', 'AI 会话', '资源类型角标(图 / 音 / 视)', '类型区分色', '❌ 不需变', '固定', '类型标识跨机构一致，便于用户快速识别'],
    ['三端通用', '会员体系', '会员标识 / 会员价值色', '价值橙', '⚠️ 建议固定', '--amber', '会员是平台级权益体系，建议跨机构统一色（可商议）'],
]

wb = openpyxl.Workbook()
ws = wb.active
ws.title = '品牌色影响清单'
head_fill = PatternFill('solid', fgColor='4B57E8')
head_font = Font(bold=True, color='FFFFFF', size=11)
change_fill = PatternFill('solid', fgColor='EAF7F0')   # 需变：淡绿
keep_fill = PatternFill('solid', fgColor='F4F4F6')     # 不需变：淡灰
thin = Side(style='thin', color='DDDDDD')
border = Border(left=thin, right=thin, top=thin, bottom=thin)
wrap = Alignment(wrap_text=True, vertical='center')
center = Alignment(horizontal='center', vertical='center')

ws.append(H)
for c in range(1, len(H) + 1):
    cell = ws.cell(row=1, column=c)
    cell.fill = head_fill; cell.font = head_font; cell.alignment = center; cell.border = border

for i, r in enumerate(ROWS, start=2):
    ws.cell(row=i, column=1, value=i - 1)
    for c, v in enumerate(r, start=2):
        ws.cell(row=i, column=c, value=v)
    fill = change_fill if r[4].startswith('✅') else keep_fill
    for c in range(1, len(H) + 1):
        cell = ws.cell(row=i, column=c)
        cell.border = border
        cell.alignment = center if c in (1, 6) else wrap
        if c == 6:
            cell.fill = fill

widths = [6, 13, 22, 30, 20, 14, 22, 30]
for col, w in zip('ABCDEFGH', widths):
    ws.column_dimensions[col].width = w
ws.freeze_panes = 'A2'

import os
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'brand-color-impact.xlsx')
wb.save(out)
n_change = sum(1 for r in ROWS if r[4].startswith('✅'))
n_keep = len(ROWS) - n_change
print(f'生成完成: {out}')
print(f'共 {len(ROWS)} 条：需变 {n_change} · 不需变/建议固定 {n_keep}')
