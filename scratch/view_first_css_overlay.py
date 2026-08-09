with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
matches = list(re.finditer(r'\.character-overlay', css))
with open('scratch/first_overlay_css.txt', 'w', encoding='utf-8') as f_out:
    for i, m in enumerate(matches[:3]):
        f_out.write(f"Occurrence {i+1}:\n")
        start = max(0, m.start() - 100)
        end = min(len(css), m.end() + 600)
        f_out.write(css[start:end])
        f_out.write("\n" + "="*40 + "\n")

print("Done! Written to scratch/first_overlay_css.txt")
