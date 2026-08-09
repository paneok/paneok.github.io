import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Let's search for imageContainers or _zoomInitialized
matches = [m.start() for m in re.finditer(r'imageContainers|zoom|initZoom|card', js, re.IGNORECASE)]
print(f"Total occurrences of keywords: {len(matches)}")

# Let's write a python script to search for the definition of the function that adds click listeners to character cards/images.
# We saw imageContainers.forEach in click_snippet.txt. Let's find where that loop starts.
# Let's search for "imageContainers =" or "const imageContainers" or similar.
lines = js.splitlines()
for line_no, line in enumerate(lines, 1):
    if 'imagecontainers' in line.lower() or '_zoom' in line.lower() or 'character-photo' in line.lower():
        print(f"{line_no}: {line.strip()}")
