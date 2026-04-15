+++
title = "Introduction"
description = "open-utdr-enemies 的初始化方式与内容抓取流程。"
date = 2026-04-15T00:00:00+08:00
updated = 2026-04-15T00:00:00+08:00
draft = false
weight = 10
sort_by = "weight"
template = "docs/page.html"

[extra]
lead = "使用 Zola + AdiDoks 初始化站点，并通过 Python 脚本抓取指定 Bilibili opus。"
toc = true
top = false
+++

## 初始化脚本

仓库已经提供 `scripts/init_adidoks.sh`，作用如下：

- 检查 `themes/adidoks` 是否存在
- 不存在时自动克隆 `https://github.com/aaranxu/adidoks.git`
- 输出后续的抓取、预览与构建命令

直接执行：

```bash
./scripts/init_adidoks.sh
```

## 配置说明

站点主配置位于 `config.toml`，当前已完成以下定制：

- 站点名称设置为 `open-utdr-enemies`
- 主题设置为 `adidoks`
- 默认语言设置为 `zh`
- 站点主导航包含 `Docs` 与 `Articles`
- 关闭 CJK 场景下体验一般的本地全文搜索
- 页脚直接保留 README 和原始 Bilibili 图文链接

## 内容抓取

抓取脚本位于 `scripts/fetch_bilibili_opus.py`，默认针对：

```text
https://www.bilibili.com/opus/1190046793906257945
```

执行命令：

```bash
python3 scripts/fetch_bilibili_opus.py \
  --opus-id 1190046793906257945 \
  --output content/docs/articles/opus-1190046793906257945.md \
  --json-output data/bilibili/1190046793906257945.json
```

对应输出：

- `content/docs/articles/opus-1190046793906257945.md`
- `data/bilibili/1190046793906257945.json`

## 本地开发

```bash
./scripts/init_adidoks.sh
python3 scripts/fetch_bilibili_opus.py \
  --opus-id 1190046793906257945 \
  --output content/docs/articles/opus-1190046793906257945.md \
  --json-output data/bilibili/1190046793906257945.json
zola serve
```

如果只需要构建静态文件：

```bash
zola build
```
