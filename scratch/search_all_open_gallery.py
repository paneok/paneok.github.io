import os
import re

print("--- Searching for openGalleryModal in all codebase files ---")
for root, dirs, files in os.walk('.'):
    if '.git' in root or '.claude' in root or 'node_modules' in root or 'scratch' in root:
        continue
    for file in files:
        if file.endswith(('.js', '.html', '.css')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            if 'openGalleryModal' in content:
                print(f"\nFile: {path}")
                lines = content.splitlines()
                for i, line in enumerate(lines, 1):
                    if 'openGalleryModal' in line:
                        print(f"  {i}: {line.strip()}")
