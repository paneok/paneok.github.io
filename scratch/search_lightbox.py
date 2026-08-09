with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
matches = list(re.finditer(r'lightbox', js, re.IGNORECASE))
with open('scratch/lightbox_snippet.txt', 'w', encoding='utf-8') as f_out:
    f_out.write(f"Total occurrences of lightbox: {len(matches)}\n")
    for idx, m in enumerate(matches):
        start = max(0, m.start() - 100)
        end = min(len(js), m.end() + 400)
        f_out.write(f"Occurrence {idx+1}:\n")
        f_out.write(js[start:end])
        f_out.write("\n" + "="*40 + "\n")

print("Written to scratch/lightbox_snippet.txt")
