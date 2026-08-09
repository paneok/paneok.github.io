with open('styles.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('scratch/all_pointer_events.txt', 'w', encoding='utf-8') as f_out:
    for idx, line in enumerate(lines):
        if 'pointer-events' in line:
            f_out.write(f"Line {idx+1}: {line.strip()}\n")
            # print 2 lines before and 2 lines after
            start_context = max(0, idx - 2)
            end_context = min(len(lines), idx + 3)
            for j in range(start_context, end_context):
                f_out.write(f"  {j+1}: {lines[j]}")
            f_out.write("-" * 40 + "\n")

print("Written all pointer-events context to scratch/all_pointer_events.txt")
