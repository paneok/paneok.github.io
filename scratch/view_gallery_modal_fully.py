with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = 1117
end = 1340

with open('scratch/gallery_modal_full_code.txt', 'w', encoding='utf-8') as f_out:
    for idx in range(start - 1, min(end, len(lines))):
        f_out.write(f"{idx+1}: {lines[idx]}")

print(f"Successfully written lines {start} to {end} to scratch/gallery_modal_full_code.txt")
