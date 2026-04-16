#!/usr/bin/env python3
import os
import re
from pathlib import Path

BASE_DIR = Path("/root/projects/open-utdr-enemies")
ENEMIES_DIR = BASE_DIR / "content/docs/enemies"

def fix_image_paths(md_file):
    content = md_file.read_text(encoding='utf-8')
    
    # Replace patterns like: ./froggit/filename.png -> ./filename.png
    fixed = re.sub(r'\./[^/]+/', './', content)
    
    if fixed != content:
        md_file.write_text(fixed, encoding='utf-8')
        print(f"Fixed: {md_file.parent.name}/{md_file.stem}")

def main():
    for category_dir in ENEMIES_DIR.iterdir():
        if not category_dir.is_dir():
            continue
        
        for md_file in category_dir.glob("*/index.md"):
            fix_image_paths(md_file)

if __name__ == "__main__":
    main()