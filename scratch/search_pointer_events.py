with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
matches = list(re.finditer(r'pointer-events', css))
print(f"Total occurrences of pointer-events: {len(matches)}")
for idx, m in enumerate(matches):
    start = max(0, m.start() - 150)
    end = min(len(css), m.end() + 150)
    print(f"Occurrence {idx+1}:")
    print(css[start:end])
    print("="*40)
