with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
funcs = ['openLightbox', 'closeLightbox', 'nextLightbox', 'prevLightbox', 'handleLightboxGestureEnd', 'setupPinchToZoomForGalleryImage']
lines = js.splitlines()

for fn in funcs:
    matches = list(re.finditer(r'function\s+' + fn, js))
    if matches:
        start_idx = matches[0].start()
        # count lines to start_idx
        line_num = js[:start_idx].count('\n') + 1
        print(f"Function {fn} is at line {line_num}")
    else:
        print(f"Function {fn} not found")
