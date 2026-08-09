with open('js/characters-renderer.js', 'r', encoding='utf-8') as f:
    renderer = f.read()

print("--- characters-renderer.js search ---")
lines = renderer.splitlines()
for line_no, line in enumerate(lines, 1):
    if 'click' in line or 'open' in line or 'zoom' in line or 'gallery' in line or 'event' in line:
        print(f"{line_no}: {line.strip()}")
