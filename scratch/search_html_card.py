with open('catalog.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
matches = list(re.finditer(r'character-card', html))

with open('scratch/html_card.txt', 'w', encoding='utf-8') as f_out:
    f_out.write(f"Total occurrences: {len(matches)}\n")
    for m in matches[:5]:
        start = max(0, m.start() - 200)
        end = min(len(html), m.end() + 1000)
        f_out.write(html[start:end])
        f_out.write("\n" + "="*60 + "\n")

print("HTML card written to scratch/html_card.txt")
