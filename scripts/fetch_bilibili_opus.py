#!/usr/bin/env python3

from __future__ import annotations

import argparse
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API_URL = "https://api.bilibili.com/x/polymer/web-dynamic/v1/opus/detail"
PAGE_URL = "https://www.bilibili.com/opus/{opus_id}"
DEFAULT_FEATURES = ",".join(
    [
        "onlyfansVote",
        "onlyfansAssetsV2",
        "decorationCard",
        "htmlNewStyle",
        "ugcDelete",
        "editable",
        "opusPrivateVisible",
        "tribeeEdit",
        "avatarAutoTheme",
        "avatarTypeOpus",
    ]
)
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


def http_get_text(url: str, headers: dict[str, str]) -> str:
    request = Request(url, headers=headers)
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def fetch_json(url: str, params: dict[str, str], headers: dict[str, str]) -> dict[str, Any]:
    query = urlencode(params)
    body = http_get_text(f"{url}?{query}", headers=headers)
    return json.loads(body)


def extract_initial_state(page_html: str) -> dict[str, Any]:
    match = re.search(r"__INITIAL_STATE__=(\{.*?\});", page_html, re.S)
    if not match:
        raise RuntimeError("Unable to find __INITIAL_STATE__ in Bilibili opus page")
    return json.loads(match.group(1))


def find_module(modules: list[dict[str, Any]], key: str) -> dict[str, Any]:
    for module in modules:
        if key in module:
            return module[key]
    raise KeyError(f"Missing module: {key}")


def normalize_cookie(cookie: str | None) -> str:
    if not cookie:
        return "buvid3=open-utdr-enemies"
    return cookie if "=" in cookie else f"buvid3={cookie}"


def fetch_page_detail(opus_id: str) -> dict[str, Any] | None:
    page_html = http_get_text(PAGE_URL.format(opus_id=opus_id), {"User-Agent": USER_AGENT})
    state = extract_initial_state(page_html)
    return state.get("detail")


def fetch_opus(opus_id: str, cookie: str | None) -> tuple[dict[str, Any], dict[str, Any], str]:
    headers = {
        "User-Agent": USER_AGENT,
        "Referer": "https://www.bilibili.com/",
        "Cookie": normalize_cookie(cookie),
    }
    response = fetch_json(
        API_URL,
        {
            "id": opus_id,
            "timezone_offset": "-480",
            "features": DEFAULT_FEATURES,
        },
        headers,
    )
    if response.get("code") == 0 and response.get("data", {}).get("item"):
        try:
            page_detail = fetch_page_detail(opus_id)
        except Exception:
            page_detail = None
        if page_detail:
            return page_detail, response, "api+html"
        return response["data"]["item"], response, "api"

    page_detail = fetch_page_detail(opus_id)
    if not page_detail:
        raise RuntimeError(f"Unable to load opus {opus_id} from API or page fallback")
    return page_detail, page_detail, "html"


def render_word(word: dict[str, Any]) -> str:
    text = html.escape(word.get("words", ""), quote=False)
    style = word.get("style", {})
    if style.get("bold"):
        text = f"<strong>{text}</strong>"
    if style.get("italic"):
        text = f"<em>{text}</em>"
    if style.get("underline"):
        text = f"<u>{text}</u>"
    if style.get("strike"):
        text = f"<s>{text}</s>"
    return text


def render_nodes(nodes: list[dict[str, Any]], preserve_style: bool = True) -> str:
    rendered = []
    for node in nodes:
        node_type = node.get("type")
        if node_type == "TEXT_NODE_TYPE_WORD":
            word = node.get("word", {})
            rendered.append(render_word(word) if preserve_style else html.escape(word.get("words", ""), quote=False))
    return "".join(rendered)


def render_paragraph(paragraph: dict[str, Any]) -> str:
    para_type = paragraph["para_type"]
    if para_type == 1:
        return render_nodes(paragraph.get("text", {}).get("nodes", []))
    if para_type == 2:
        pics = paragraph.get("pic", {}).get("pics", [])
        return "\n".join(f"![]({pic['url']})" for pic in pics if pic.get("url"))
    if para_type == 3:
        return "---"
    if para_type == 7:
        code = paragraph.get("code", {})
        lang = code.get("lang") or "text"
        return f"```{lang}\n{code.get('content', '')}\n```"
    if para_type == 8:
        heading = paragraph.get("heading", {})
        level = min(max(int(heading.get("level", 1)), 1), 6)
        return f"{'#' * level} {render_nodes(heading.get('nodes', []), preserve_style=False)}"
    raise RuntimeError(f"Unsupported paragraph type: {para_type}")


def toml_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def build_front_matter(item: dict[str, Any], opus_id: str) -> str:
    basic = item.get("basic", {})
    modules = item.get("modules", [])
    author = find_module(modules, "module_author")
    pub_ts = author.get("pub_ts")
    pub_iso = datetime.fromtimestamp(pub_ts, tz=timezone.utc).astimezone().isoformat() if pub_ts else datetime.now().astimezone().isoformat()
    title = basic.get("title", f"Opus {opus_id}")
    description = f"Bilibili opus archive for {opus_id}."
    return "\n".join(
        [
            "+++",
            f'title = "{toml_escape(title)}"',
            f'description = "{toml_escape(description)}"',
            f"date = {pub_iso}",
            f"updated = {pub_iso}",
            "draft = false",
            "weight = 10",
            'sort_by = "weight"',
            'template = "docs/page.html"',
            "",
            "[extra]",
            "toc = true",
            "top = false",
            "+++",
            "",
        ]
    )


def build_markdown(item: dict[str, Any], opus_id: str) -> str:
    modules = item.get("modules", [])
    content_module = find_module(modules, "module_content")
    body_parts = [render_paragraph(paragraph) for paragraph in content_module.get("paragraphs", [])]
    return build_front_matter(item, opus_id) + "\n\n".join(body_parts).rstrip() + "\n"


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch a Bilibili opus and render it as Markdown.")
    parser.add_argument("--opus-id", required=True, help="The numeric Bilibili opus ID.")
    parser.add_argument("--output", required=True, help="Markdown output path.")
    parser.add_argument("--json-output", required=True, help="Raw JSON output path.")
    parser.add_argument(
        "--cookie",
        default=None,
        help="Optional Cookie header content. If omitted, a placeholder buvid3 cookie is used.",
    )
    args = parser.parse_args()

    item, raw_payload, source = fetch_opus(args.opus_id, args.cookie)
    markdown = build_markdown(item, args.opus_id)

    json_payload = {
        "fetched_at": datetime.now().astimezone().isoformat(),
        "source_method": source,
        "source_url": PAGE_URL.format(opus_id=args.opus_id),
        "opus_id": args.opus_id,
        "payload": raw_payload,
    }

    output_path = Path(args.output)
    json_output_path = Path(args.json_output)
    write_text(output_path, markdown)
    write_json(json_output_path, json_payload)

    print(f"Saved Markdown to: {output_path}")
    print(f"Saved JSON to: {json_output_path}")
    print(f"Fetch method: {source}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
