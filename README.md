# open-utdr-enemies

<img src="https://img.shields.io/badge/Deltarune-Undertale-black?style=for-the-badge&labelColor=001225&logo=undertale&logoColor=ff0000" /> <img src="https://img.shields.io/badge/Zola-Static%20Site-2f4858?style=for-the-badge" /> <img src="https://img.shields.io/badge/Theme-AdiDoks-c67c4e?style=for-the-badge" /> <br>
<img src="https://img.shields.io/badge/License%20(Code)-MIT%20or%20Apache--2.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Content-Authorized%20Use-green?style=for-the-badge" />

> **Status**: Active UTRP animation lab, source data, and code-generation pipeline. The site publishes browser-previewable enemy animation data alongside starter snippets for reuse.

**open-utdr-enemies** is an open documentation site dedicated to
**[Undertale](https://undertale.com/) / [Deltarune](https://deltarune.com/)** enemies,
animation, and battle research, built with [Zola](https://www.getzola.org/) and
the [AdiDoks](https://github.com/aaranxu/adidoks) theme.

| English | 简体中文 |
|---------|----------|
| English | [简体中文](./README.zh-CN.md) |

## What Is This?

This repository organizes and publishes reusable Undertale / Deltarune enemy research materials, including:

- Enemy compositions and organization notes
- Animation swing parameter research
- Behavior logic and battle logic references
- Source article archives
- Browser-previewable UTRP animation data

The repository currently includes:

- A runnable `Zola + AdiDoks` documentation site
- UTRP source files and generator under [`tools/utrp`](./tools/utrp)
- Generated browser UTRP JSON under [`static/utrp`](./static/utrp)
- A Canvas2D animation lab embedded in site pages
- Generated GameMaker and SoupRune starter snippets under [`static/generated-code`](./static/generated-code)
- `scripts/fetch_bilibili_opus.py` for fetching Bilibili opus and rendering Markdown

### Why Zola + AdiDoks?

[Zola](https://www.getzola.org/) is a fast static site generator with a straightforward content model, while [AdiDoks](https://github.com/aaranxu/adidoks) provides a documentation-focused theme on top of it.

This combination is well-suited for a research repository because it keeps the repository simple:

- Source materials are stored directly in Markdown
- Generated pages are easy to host, review, and maintain long-term
- Documentation sections can be expanded gradually without changing the toolchain

## Current Scope

The current focus is the UTRP animation pipeline:

- Maintain source animation programs in `tools/utrp/source`
- Generate browser JSON and starter code from those sources
- Preview enemy animations in the Canvas2D lab
- Keep public documentation and source archives available through the Zola site

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

### Work With UTRP Data

Run the UTRP tests:

```bash
just test-utrp
```

Regenerate browser JSON and starter snippets:

```bash
just generate-utrp
```

Run the repository checks:

```bash
just check
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
│   ├── lab/
│   ├── ut/
│   └── docs/
│       ├── articles/
│       └── getting-started/
├── data/
│   └── bilibili/
├── scripts/
│   ├── fetch_bilibili_opus.py
│   └── init_adidoks.sh
├── static/
│   ├── generated-code/
│   ├── sprites/
│   └── utrp/
├── tools/
│   └── utrp/
├── themes/
│   └── adidoks/            # Populated by init script if missing
├── justfile
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
- Main navigation entries: `UNDERTALE`, `deltarune`, `Archive`, and `About`

For initialization instructions within the repository, see
[`content/docs/getting-started/introduction.md`](./content/docs/getting-started/introduction.md).

## License and Content Rights

This repository has two different layers of rights:

- Original code, scripts, configuration, and self-written documentation in the repository use dual licensing: [MIT](./LICENSE-MIT) or [Apache-2.0](./LICENSE-APACHE)
- Imported third-party article content does not automatically adopt the above terms due to the repository license

The article content in this repository has been officially authorized for use by the original authors. The rights to imported source materials remain with the original authors.
See [NOTICE.md](./NOTICE.md) for details.

## Acknowledgements

- Fonts used in the Undertale theme are sourced from the [UTCLC/DTTVL-Fonts](https://github.com/UTCLC/DTTVL-Fonts) repository.
