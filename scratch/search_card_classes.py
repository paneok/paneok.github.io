import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Let's find all CSS selectors that contain 'card'
card_selectors = set(re.findall(r'\.[\w-]*card[\w-]*', css))
print("--- Card classes in styles.css ---")
for sel in sorted(card_selectors):
    print(sel)

# Also let's check index.html for card elements
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

card_tags = set(re.findall(r'class="[^"]*card[^"]*"', html))
print("\n--- Card classes in index.html ---")
for tag in sorted(card_tags):
    print(tag)

# Let's check catalog.html for card elements
with open('catalog.html', 'r', encoding='utf-8') as f:
    cat_html = f.read()

cat_card_tags = set(re.findall(r'class="[^"]*card[^"]*"', cat_html))
print("\n--- Card classes in catalog.html ---")
for tag in sorted(cat_card_tags):
    print(tag)
