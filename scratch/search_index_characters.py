with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

if 'characters-grid' in html:
    print("Found characters-grid in index.html!")
else:
    print("characters-grid not found in index.html")
