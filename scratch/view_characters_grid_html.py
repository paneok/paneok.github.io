with open('catalog.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
match = re.search(r'id="characters-grid"', html)
if match:
    start = match.start()
    print(html[start:start+1000])
else:
    print("characters-grid not found!")
