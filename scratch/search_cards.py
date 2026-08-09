import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Let's search for card-related words: 'card', 'expand', 'click', etc.
print("--- script.js search ---")
matches = re.finditer(r'(\b\w*card\w*\b|\bexpand\b|\bclick\b)', js, re.IGNORECASE)
card_lines = []
for line_no, line in enumerate(js.splitlines(), 1):
    if 'card' in line.lower() or 'expand' in line.lower() or 'open' in line.lower() and 'card' in line.lower():
        card_lines.append((line_no, line.strip()))

print(f"Found {len(card_lines)} lines matching search terms in script.js:")
for lno, text in card_lines[:40]:
    print(f"{lno}: {text}")
