with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
matches = list(re.finditer(r'function\s+createGalleryModal', js))
if matches:
    start_idx = matches[0].start()
    line_num = js[:start_idx].count('\n') + 1
    print(f"Function createGalleryModal is at line {line_num}")
    
    # Write 80 lines
    lines = js.splitlines()
    with open('scratch/create_gallery_modal.txt', 'w', encoding='utf-8') as f_out:
        for i in range(line_num - 1, min(line_num + 80, len(lines))):
            f_out.write(f"{i+1}: {lines[i]}\n")
else:
    print("createGalleryModal not found!")
