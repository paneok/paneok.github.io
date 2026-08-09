import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Let's search for click event listeners on character-card, program-card, team-member-card, advantage-card etc.
targets = ['character-card', 'program-card', 'team-member-card', 'advantage-card', 'additional-service-card']

for target in targets:
    print(f"\n--- Occurrences of {target} in script.js ---")
    matches = [m.start() for m in re.finditer(target, js)]
    for m in matches:
        # Extract 200 chars before and 300 chars after
        start = max(0, m - 200)
        end = min(len(js), m + 500)
        snippet = js[start:end]
        print(f"Index: {m}\nSnippet:\n{snippet}\n" + "="*40)
