# open-utdr-enemies

Open documentation site for Undertale and Deltarune enemy, animation, and battle
research, built with Zola and the AdiDoks theme.

基于 Zola 与 AdiDoks 主题构建的 Undertale / Deltarune 敌人、动画与战斗研究文档站。

## 简体中文

### 项目简介

`open-utdr-enemies` 旨在整理 Undertale 与 Deltarune 中敌人相关的资料，
包括敌人构成、动画参数、行为逻辑、素材引用关系与研究记录。

当前仓库已包含：

- `Zola + AdiDoks` 的站点配置与初始化脚本
- 双许可证声明：`MIT / Apache-2.0`
- 指定 Bilibili `opus` 内容的抓取与 Markdown 生成脚本
- 已生成的目标文章页面与原始 JSON 存档

### 授权声明

本项目所使用的文章内容已获得原作者的正式授权。

需要特别说明：

- 仓库中的原创源码、构建脚本、配置文件与仓库自写文档，采用 `MIT / Apache-2.0` 双许可证
- 通过脚本引入的第三方文章内容不因仓库许可证自动转授权
- 指定 Bilibili 图文内容的权利仍归原作者所有，具体见 [NOTICE.md](./NOTICE.md)

### 快速开始

```bash
./scripts/init_adidoks.sh
python3 scripts/fetch_bilibili_opus.py \
  --opus-id 1190046793906257945 \
  --output content/docs/articles/opus-1190046793906257945.md \
  --json-output data/bilibili/1190046793906257945.json
zola serve
```

### 仓库结构

```text
.
├── config.toml
├── content/
│   └── docs/
├── data/bilibili/
├── scripts/
│   ├── init_adidoks.sh
│   └── fetch_bilibili_opus.py
├── LICENSE
├── LICENSE-APACHE
├── LICENSE-MIT
└── NOTICE.md
```

## English

### Overview

`open-utdr-enemies` is a documentation site for Undertale and Deltarune enemy
research, with a focus on composition analysis, animation parameters, behavior
logic, source references, and archival notes.

This repository already includes:

- a working `Zola + AdiDoks` project layout
- dual licensing under `MIT / Apache-2.0`
- a Bilibili opus fetcher and Markdown renderer
- generated archival content and raw JSON output for the requested opus

### Authorization Notice

The article content used in this project is officially authorized by the
original author.

Please note:

- the repository's original source code, build scripts, configuration, and
  repository-authored documentation are dual-licensed under `MIT / Apache-2.0`
- imported third-party article content is not automatically relicensed under
  those terms
- rights to the referenced Bilibili article remain with the original author;
  see [NOTICE.md](./NOTICE.md)

### Quick Start

```bash
git clone <your-repo-url> open-utdr-enemies
cd open-utdr-enemies
./scripts/init_adidoks.sh
python3 scripts/fetch_bilibili_opus.py \
  --opus-id 1190046793906257945 \
  --output content/docs/articles/opus-1190046793906257945.md \
  --json-output data/bilibili/1190046793906257945.json
zola serve
```

### Licenses

Use either of the following for the repository's original code and authored
materials:

- [MIT](./LICENSE-MIT)
- [Apache-2.0](./LICENSE-APACHE)

Third-party imported content follows its original rights and project-specific
authorization notice.
