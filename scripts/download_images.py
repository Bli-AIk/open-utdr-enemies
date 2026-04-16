#!/usr/bin/env python3
import os
import re
import urllib.request
from pathlib import Path

BASE_DIR = Path("/root/projects/open-utdr-enemies")
ENEMIES_DIR = BASE_DIR / "content/docs/enemies"
STATIC_DIR = BASE_DIR / "static/assets/enemies"

def get_image_urls(md_file):
    content = md_file.read_text(encoding='utf-8')
    urls = re.findall(r'http://i0\.hdslb\.com/bfs/new_dyn/[^)]+', content)
    return list(set(urls))

def download_image(url, dest_path):
    try:
        urllib.request.urlretrieve(url, dest_path)
        print(f"  Downloaded: {dest_path.name}")
    except Exception as e:
        print(f"  Failed to download {url}: {e}")

def get_local_path(url):
    filename = url.split('/')[-1]
    return f"./assets/{filename}"

def process_article(md_path):
    category = md_path.parent.name
    article_name = md_path.stem
    
    target_dir = STATIC_DIR / category / article_name
    target_dir.mkdir(parents=True, exist_ok=True)
    
    content = md_path.read_text(encoding='utf-8')
    urls = re.findall(r'http://i0\.hdslb\.com/bfs/new_dyn/[^)]+', content)
    urls = list(set(urls))
    
    if not urls:
        return
    
    print(f"Processing: {category}/{article_name}")
    
    for url in urls:
        filename = url.split('/')[-1]
        local_path = target_dir / filename
        if not local_path.exists():
            download_image(url, local_path)
        
        local_ref = f"../assets/{article_name}/{filename}"
        content = content.replace(url, local_ref)
    
    md_path.write_text(content, encoding='utf-8')
    print(f"  Updated markdown references")

def main():
    for category_dir in ENEMIES_DIR.iterdir():
        if not category_dir.is_dir():
            continue
        
        for md_file in category_dir.glob("*.md"):
            process_article(md_file)

if __name__ == "__main__":
    main()