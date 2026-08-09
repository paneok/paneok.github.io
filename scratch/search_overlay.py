with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
selectors = [r'\.character-overlay', r'\.btn-select\b', r'\.character-image-container']
with open('scratch/overlay_selectors.txt', 'w', encoding='utf-8') as f_out:
    for sel in selectors:
        matches = list(re.finditer(sel, css))
        f_out.write(f"\n==================== Selector: {sel} (Found {len(matches)}) ====================\n")
        for idx, m in enumerate(matches):
            start = max(0, m.start() - 100)
            end = min(len(css), m.end() + 400)
            f_out.write(f"Occurrence {idx+1}:\n")
            f_out.write(css[start:end])
            f_out.write("\n" + "-"*40 + "\n")

print("Done! Written to scratch/overlay_selectors.txt")
