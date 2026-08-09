with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Search for setTimeout(initializeImageZoom
found_idx = []
for idx, line in enumerate(lines):
    if 'setTimeout(initializeImageZoom' in line:
        found_idx.append(idx)

print("Found at lines:", [idx+1 for idx in found_idx])
if found_idx:
    start_line = max(1, found_idx[0] - 20)
    end_line = min(len(lines), found_idx[-1] + 30)
    with open('scratch/script_zoom_setup.txt', 'w', encoding='utf-8') as f_out:
        for i in range(start_line - 1, end_line):
            f_out.write(f"{i+1}: {lines[i]}")
    print("Written to scratch/script_zoom_setup.txt")
