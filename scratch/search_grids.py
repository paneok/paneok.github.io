with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
classes = ['characters-grid', 'programs-grid', 'additional-services-grid', 'services-grid']
with open('scratch/grids_css.txt', 'w', encoding='utf-8') as f_out:
    for cls in classes:
        matches = list(re.finditer(cls, css))
        f_out.write(f"\n==================== Class: {cls} (Found {len(matches)}) ====================\n")
        for idx, m in enumerate(matches):
            start = max(0, m.start() - 150)
            end = min(len(css), m.end() + 450)
            f_out.write(f"Occurrence {idx+1}:\n")
            f_out.write(css[start:end])
            f_out.write("\n" + "-"*40 + "\n")

print("Grid styles successfully written to scratch/grids_css.txt")
