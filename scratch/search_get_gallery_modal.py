with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
matches = list(re.finditer(r'function\s+getGalleryModal', js))
if matches:
    start = matches[0].start()
    print(js[start:start+2500])
else:
    print("getGalleryModal not found!")
