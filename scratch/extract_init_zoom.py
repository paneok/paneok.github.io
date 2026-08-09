with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Output lines 950 to 1050 (1-indexed, so index 949 to 1049)
with open('scratch/init_zoom_block.txt', 'w', encoding='utf-8') as f_out:
    for i in range(949, min(1049, len(lines))):
        f_out.write(f"{i+1}: {lines[i]}")

print("Successfully written lines to scratch/init_zoom_block.txt")
