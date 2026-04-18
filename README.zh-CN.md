# open-utdr-enemies

<img src="https://img.shields.io/badge/Deltarune-Undertale-black?style=for-the-badge&labelColor=001225&logo=undertale&logoColor=ff0000" /> <img src="https://img.shields.io/badge/Zola-静态站点-2f4858?style=for-the-badge" /> <img src="https://img.shields.io/badge/Theme-AdiDoks-c67c4e?style=for-the-badge" /> <br>
<img src="https://img.shields.io/badge/许可证%20(代码)-MIT%20或%20Apache--2.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/内容-授权使用-green?style=for-the-badge" />

> **状态**: 初始文档归档阶段。站点骨架已经完成，首篇获授权的来源文章也已经归档进仓库。

**open-utdr-enemies** 是一个围绕
**[Undertale](https://undertale.com/) / [Deltarune](https://deltarune.com/)** 敌人、
动画与战斗研究的开放文档站，使用 [Zola](https://www.getzola.org/) 和
[AdiDoks](https://github.com/aaranxu/adidoks) 主题构建。

| English | 简体中文 |
|---------|----------|
| [English](./README.md) | 简体中文 |

## 这是什么？

这个仓库的目标是持续整理并发布可复用的 Undertale / Deltarune 敌人研究资料，包括：

- 敌人构成与整理笔记
- 动画摆动参数研究
- 行为逻辑与战斗逻辑参考
- 来源文章归档
- 供后续扩展使用的项目自写文档

当前仓库已经包含：

- 可直接运行的 `Zola + AdiDoks` 文档站
- 用于初始化主题的 `scripts/init_adidoks.sh`
- 用于抓取 Bilibili opus 并渲染 Markdown 的 `scripts/fetch_bilibili_opus.py`
- 已归档的授权文章页面 [`content/docs/articles/opus-1190046793906257945.md`](./content/docs/articles/opus-1190046793906257945.md)
- 对应的原始 JSON 快照 [`data/bilibili/1190046793906257945.json`](./data/bilibili/1190046793906257945.json)

### 为什么选择 Zola + AdiDoks？

[Zola](https://www.getzola.org/) 是一个速度快、内容模型直接清晰的静态站点生成器，
而 [AdiDoks](https://github.com/aaranxu/adidoks) 在它之上提供了偏文档站风格的主题结构。

这套组合很适合研究资料库，因为它能让仓库保持简单：

- 源资料直接保存在 Markdown 中
- 生成页面便于托管、审阅和长期维护
- 文档章节可以逐步扩展，而不需要反复更换工具链

## 当前范围

这个项目目前仍处于早期阶段。

现阶段更准确的理解方式是：它是一个已经种下第一批内容的文档归档仓库：

- 站点骨架和导航已经就位
- 第一篇来源文章已经导入
- 后续继续抓取 Bilibili opus 的流水线已经具备

比较自然的下一步包括：

1. 继续归档更多已获授权的来源文章
2. 将零散笔记整理为按主题组织的文档页面
3. 增补可复用的敌人、动画与战斗参数参考表

## 快速开始

### 初始化站点

1. 克隆本仓库：
   ```bash
   git clone <your-repo-url> open-utdr-enemies
   cd open-utdr-enemies
   ```
2. 安装 [Zola](https://www.getzola.org/documentation/getting-started/installation/)。
3. 初始化主题：
   ```bash
   ./scripts/init_adidoks.sh
   ```

### 抓取当前来源文章

```bash
python3 scripts/fetch_bilibili_opus.py \
  --opus-id 1190046793906257945 \
  --output content/docs/articles/opus-1190046793906257945.md \
  --json-output data/bilibili/1190046793906257945.json
```

### 本地运行站点

```bash
zola serve
```

如果只需要构建静态文件：

```bash
zola build
```

## 仓库结构

```text
open-utdr-enemies/
├── content/
│   ├── _index.md
│   └── docs/
│       ├── articles/
│       └── getting-started/
├── data/
│   └── bilibili/
├── scripts/
│   ├── fetch_bilibili_opus.py
│   └── init_adidoks.sh
├── themes/
│   └── adidoks/            # 若不存在，会由初始化脚本补齐
├── config.toml
├── NOTICE.md
├── LICENSE-MIT
└── LICENSE-APACHE
```

## 技术背景

### 抓取流水线

[`scripts/fetch_bilibili_opus.py`](./scripts/fetch_bilibili_opus.py) 会抓取目标
Bilibili opus，优先使用结构化 API 返回，在必要时退回到页面 HTML 解析，然后输出：

- 可直接供 Zola 使用的 Markdown 页面
- 用于追溯的原始 JSON 存档

当前仓库预置的目标是：

- 来源页面：<https://www.bilibili.com/opus/1190046793906257945>
- 渲染归档：[`content/docs/articles/opus-1190046793906257945.md`](./content/docs/articles/opus-1190046793906257945.md)
- 原始数据：[`data/bilibili/1190046793906257945.json`](./data/bilibili/1190046793906257945.json)

### 站点配置

[`config.toml`](./config.toml) 当前设置了：

- 站点标题：`open-utdr-enemies`
- 主题：`adidoks`
- 默认语言：`zh`
- 主导航入口：`Docs` 与 `Articles`

仓库内的初始化说明见
[`content/docs/getting-started/introduction.md`](./content/docs/getting-started/introduction.md)。

## 许可证与内容权利

这个仓库同时存在两层不同的权利边界：

- 仓库原创代码、脚本、配置和自写文档采用 [MIT](./LICENSE-MIT) 或 [Apache-2.0](./LICENSE-APACHE) 双许可证
- 导入的第三方文章内容不会因为仓库许可证而自动改用上述条款

当前仓库内的文章内容已经获得原作者正式授权使用。导入来源材料的权利仍归原作者所有。
具体说明见 [NOTICE.md](./NOTICE.md)。

## 鸣谢

- 本站 Undertale 风格主题所使用的字体来源于 [UTCLC/DTTVL-Fonts](https://github.com/UTCLC/DTTVL-Fonts) 仓库。
