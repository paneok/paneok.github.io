import os
import re

print("--- Searching for characters initialization/rendering triggers ---")
for file in ['script.js', 'js/characters-renderer.js', 'js/characters-filter.js']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"\nFile: {file}")
    lines = content.splitlines()
    for i, line in enumerate(lines, 1):
        if 'initializeCharactersCatalog' in line or 'loadCharacters' in line or 'renderCharacters' in line:
            print(f"  {i}: {line.strip()}")
