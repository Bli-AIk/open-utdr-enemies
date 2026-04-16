#!/usr/bin/env python3
import re
from pathlib import Path

BASE_DIR = Path("/root/projects/open-utdr-enemies")
ENEMIES_DIR = BASE_DIR / "content/docs/enemies"

def fix_extra_section(md_file):
    content = md_file.read_text(encoding='utf-8')
    
    # Fix: ensure proper spacing in [extra] section
    fixed = re.sub(
        r'\[extra\]\n  author = "毫无技术的鸽子"',
        '[extra]\n  author = "毫无技术的鸽子"\n',
        content
    )
    
    if content != fixed:
        md_file.write_text(fixed, encoding='utf-8')
        print(f"Fixed spacing: {md_file.parent.name}/{md_file.stem}")

def main():
    for category_dir in ENEMIES_DIR.iterdir():
        if not category_dir.is_dir():
            continue
        
        for md_file in category_dir.glob("*/index.md"):
            fix_extra_section(md_file)

if __name__ == "__main__":
    main()