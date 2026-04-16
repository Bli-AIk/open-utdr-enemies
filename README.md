# open-utdr-enemies

<img src="https://img.shields.io/badge/Deltarune-Undertale-black?style=for-the-badge&labelColor=001225&logo=undertale&logoColor=ff0000" /> <img src="https://img.shields.io/badge/Zola-Static%20Site-2f4858?style=for-the-badge" /> <img src="https://img.shields.io/badge/Theme-AdiDoks-c67c4e?style=for-the-badge" /> <br>
<img src="https://img.shields.io/badge/License%20(Code)-MIT%20or%20Apache--2.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Content-Authorized%20Use-green?style=for-the-badge" />

> **Status**: Initial documentation archival phase. The site skeleton is complete, and the first authorized source article has been archived.

**open-utdr-enemies** is an open documentation site dedicated to
**[Undertale](https://undertale.com/) / [Deltarune](https://deltarune.com/)** enemies,
animation, and battle research, built with [Zola](https://www.getzola.org/) and
the [AdiDoks](https://github.com/aaranxu/adidoks) theme.

| English | 简体中文 |
|---------|----------|
| English | [简体中文](./README.zh-CN.md) |

## What Is This?

This repository aims to continuously organize and publish reusable Undertale / Deltarune enemy research materials, including:

- Enemy compositions and organization notes
- Animation swing parameter research
- Behavior logic and battle logic references
- Source article archives
- Self-written documentation for future expansion

The repository currently includes:

- A runnable `Zola + AdiDoks` documentation site
- `scripts/init_adidoks.sh` for initializing the theme
- `scripts/fetch_bilibili_opus.py` for fetching Bilibili opus and rendering Markdown
- Archived authorized article: [`content/docs/articles/opus-1190046793906257945.md`](./content/docs/articles/opus-1190046793906257945.md)
- Corresponding raw JSON snapshot: [`data/bilibili/1190046793906257945.json`](./data/bilibili/1190046793906257945.json)

### Why Zola + AdiDoks?

[Zola](https://www.getzola.org/) is a fast static site generator with a straightforward content model, while [AdiDoks](https://github.com/aaranxu/adidoks) provides a documentation-focused theme on top of it.

This combination is well-suited for a research repository because it keeps the repository simple:

- Source materials are stored directly in Markdown
- Generated pages are easy to host, review, and maintain long-term
- Documentation sections can be expanded gradually without changing the toolchain

## Current Scope

This project is still in its early stages.

A more accurate way to understand it now: it is a documentation archive repository with the first batch of content already planted:

- Site skeleton and navigation are in place
- The first source article has been imported
- The pipeline for continuing to fetch Bilibili opus is ready

Natural next steps include:

1. Archive more authorized source articles
2. Organize scattered notes into topic-organized documentation pages
3. Add reusable enemy, animation, and battle parameter reference tables

## Quick Start

### Initialize the Site

1. Clone this repository:
   ```bash
   git clone <your-repo-url> open-utdr-enemies
   cd open-utdr-enemies
   ```
2. Install [Zola](https://www.getzola.org/documentation/getting-started/installation/).
3. Initialize the theme:
   ```bash
   ./scripts/init_adidoks.sh
   ```

### Fetch the Current Source Article

```bash
python3 scripts/fetch_bilibili_opus.py \
  --opus-id 1190046793906257945 \
  --output content/docs/articles/opus-1190046793906257945.md \
  --json-output data/bilibili/1190046793906257945.json
```

### Run the Site Locally

```bash
zola serve
```

To build only static files:

```bash
zola build
```

## Repository Structure

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
│   └── adidoks/            # Populated by init script if missing
├── config.toml
├── NOTICE.md
├── LICENSE-MIT
└── LICENSE-APACHE
```

## Technical Background

### Fetch Pipeline

[`scripts/fetch_bilibili_opus.py`](./scripts/fetch_bilibili_opus.py) fetches the target
Bilibili opus, preferring the structured API response and falling back to HTML parsing when necessary, then outputs:

- Markdown page ready for Zola
- Raw JSON archive for traceability

The pre-configured target in this repository is:

- Source page: <https://www.bilibili.com/opus/1190046793906257945>
- Rendered archive: [`content/docs/articles/opus-1190046793906257945.md`](./content/docs/articles/opus-1190046793906257945.md)
- Raw data: [`data/bilibili/1190046793906257945.json`](./data/bilibili/1190046793906257945.json)

### Site Configuration

[`config.toml`](./config.toml) currently sets:

- Site title: `open-utdr-enemies`
- Theme: `adidoks`
- Default language: `zh`
- Main navigation entries: `Docs` and `Articles`

For initialization instructions within the repository, see
[`content/docs/getting-started/introduction.md`](./content/docs/getting-started/introduction.md).

## License and Content Rights

This repository has two different layers of rights:

- Original code, scripts, configuration, and self-written documentation in the repository use dual licensing: [MIT](./LICENSE-MIT) or [Apache-2.0](./LICENSE-APACHE)
- Imported third-party article content does not automatically adopt the above terms due to the repository license

The article content in this repository has been officially authorized for use by the original authors. The rights to imported source materials remain with the original authors.
See [NOTICE.md](./NOTICE.md) for details.