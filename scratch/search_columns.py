with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
matches = list(re.finditer(r'grid-template-columns|columns|col', css, re.IGNORECASE))
print(f"Total matches: {len(matches)}")
with open('scratch/columns_css.txt', 'w', encoding='utf-8') as f_out:
    for idx, m in enumerate(matches):
        start = max(0, m.start() - 150)
        end = min(len(css), m.end() + 150)
        f_out.write(f"Occurrence {idx+1}:\n")
        f_out.write(css[start:end])
        f_out.write("\n" + "="*40 + "\n")

print("Written all column-related styles to scratch/columns_css.txt")
