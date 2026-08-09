with open('js/programs-renderer.js', 'r', encoding='utf-8') as f:
    js = f.read()

with open('scratch/programs_renderer_full.txt', 'w', encoding='utf-8') as f_out:
    f_out.write(js)

print("Full programs-renderer.js written to scratch/programs_renderer_full.txt")
