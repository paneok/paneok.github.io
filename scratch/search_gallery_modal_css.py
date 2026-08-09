with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
matches = list(re.finditer(r'\.gallery-modal', css))
print(f"Total occurrences of .gallery-modal in styles.css: {len(matches)}")
for idx, m in enumerate(matches):
    start = max(0, m.start() - 100)
    end = min(len(css), m.end() + 600)
    print(f"Occurrence {idx+1}:")
    print(css[start:end])
    print("="*40)
