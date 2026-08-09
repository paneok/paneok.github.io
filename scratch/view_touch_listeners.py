with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
matches = list(re.finditer(r'touchstart|touchend|touchmove', js))

with open('scratch/touch_listeners.txt', 'w', encoding='utf-8') as f_out:
    f_out.write(f"Total occurrences: {len(matches)}\n")
    for idx, m in enumerate(matches):
        f_out.write(f"Occurrence {idx+1}:\n")
        start = max(0, m.start() - 100)
        end = min(len(js), m.end() + 500)
        f_out.write(js[start:end])
        f_out.write("\n" + "="*40 + "\n")

print("Touch listeners successfully written to scratch/touch_listeners.txt")
