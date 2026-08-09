import os
import re

print("--- Searching for character-card click listeners in all JS files ---")
for root, dirs, files in os.walk('.'):
    if '.git' in root or '.claude' in root or 'node_modules' in root or 'scratch' in root:
        continue
    for file in files:
        if file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            if 'character-card' in content:
                print(f"\nFile: {path}")
                # find all occurrences and print their line context
                lines = content.splitlines()
                for i, line in enumerate(lines, 1):
                    if 'character-card' in line or 'card.addEventListener' in line or '.closest(' in line:
                        print(f"  {i}: {line.strip()}")
