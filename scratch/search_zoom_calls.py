with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
matches = [m.start() for m in re.finditer('initializeImageZoom', js)]
print(f"Total occurrences of initializeImageZoom: {len(matches)}")
for idx, m in enumerate(matches):
    start = max(0, m - 100)
    end = min(len(js), m + 300)
    print(f"Occurrence {idx+1}:")
    print(js[start:end])
    print("="*40)
