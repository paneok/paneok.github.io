with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

import re
matches = list(re.finditer(r'function\s+initTelegramTeamCircles', js))
if matches:
    start_idx = matches[0].start()
    line_num = js[:start_idx].count('\n') + 1
    print(f"Function initTelegramTeamCircles is at line {line_num}")
    
    # Write 150 lines starting from line_num
    lines = js.splitlines()
    with open('scratch/team_circles.txt', 'w', encoding='utf-8') as f_out:
        for i in range(line_num - 1, min(line_num + 150, len(lines))):
            f_out.write(f"{i+1}: {lines[i]}\n")
else:
    print("initTelegramTeamCircles not found!")
