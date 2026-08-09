with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
matches = list(re.finditer(r'hasMoved', js))
print(f"Total matches for hasMoved: {len(matches)}")
for idx, m in enumerate(matches):
    start = max(0, m.start() - 100)
    end = min(len(js), m.end() + 400)
    print(f"Occurrence {idx+1}:")
    print(js[start:end])
    print("="*40)
