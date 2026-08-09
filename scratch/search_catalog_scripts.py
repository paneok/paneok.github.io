with open('catalog.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
scripts = re.findall(r'<script[^>]*>.*?</script>|<script[^>]*>', html, re.DOTALL)
print("--- Scripts in catalog.html ---")
for s in scripts:
    print(s)
