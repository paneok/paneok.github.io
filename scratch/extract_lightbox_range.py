with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = 2390
end = min(2810, len(lines))

with open('scratch/lightbox_range.txt', 'w', encoding='utf-8') as f_out:
    for idx in range(start - 1, end):
        f_out.write(f"{idx+1}: {lines[idx]}")

print(f"Written lines {start} to {end} to scratch/lightbox_range.txt")
