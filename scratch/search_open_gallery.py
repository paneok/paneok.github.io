import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Find openGalleryModal function
matches = list(re.finditer(r'function\s+openGalleryModal', js))
if matches:
    start_idx = matches[0].start()
    # Write from start_idx to 4000 characters after
    snippet = js[start_idx:start_idx+4000]
    with open('scratch/gallery_modal_snippet.txt', 'w', encoding='utf-8') as f_out:
        f_out.write(snippet)
    print("Found openGalleryModal! Written to scratch/gallery_modal_snippet.txt")
else:
    print("openGalleryModal not found!")

# Let's search for any other open / expand modal or details logic
matches_other = list(re.finditer(r'function\s+(?:open|show|toggle)\w*Modal', js, re.IGNORECASE))
for m in matches_other:
    print(f"Found other modal function: {m.group(0)}")
