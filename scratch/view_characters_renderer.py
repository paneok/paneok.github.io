with open('js/characters-renderer.js', 'r', encoding='utf-8') as f:
    js = f.read()

with open('scratch/renderer_full.txt', 'w', encoding='utf-8') as f_out:
    f_out.write(js)

print("Full characters-renderer.js written to scratch/renderer_full.txt")
