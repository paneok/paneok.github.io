with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
matches = list(re.finditer(r'async\s+function\s+initializeCharactersCatalog', js))
if matches:
    start_idx = matches[0].start()
    line_num = js[:start_idx].count('\n') + 1
    print(f"Function initializeCharactersCatalog is at line {line_num}")
    
    # Write 100 lines
    lines = js.splitlines()
    with open('scratch/init_catalog.txt', 'w', encoding='utf-8') as f_out:
        for i in range(line_num - 1, min(line_num + 100, len(lines))):
            f_out.write(f"{i+1}: {lines[i]}\n")
else:
    print("initializeCharactersCatalog not found!")
