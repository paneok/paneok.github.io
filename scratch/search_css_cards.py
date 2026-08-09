with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Let's search for character-card or other card definitions in styles.css
import re
matches = list(re.finditer(r'\.character-card', css))
print(f"Total occurrences of .character-card: {len(matches)}")
for m in matches:
    start = max(0, m.start() - 100)
    end = min(len(css), m.end() + 600)
    print(css[start:end])
    print("="*60)
