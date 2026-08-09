# -*- coding: utf-8 -*-
import json

output = []

try:
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        char_data = json.load(f)
    for c in char_data.get('characters', []):
        name = c.get('name', '')
        if 'фокус' in name.lower() or 'волшеб' in name.lower():
            output.append(f"Found character: ID={c.get('id')}, Name='{name}', Category='{c.get('category')}'")
except Exception as e:
    output.append(f"Error characters: {e}")

with open('explore_output.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))
