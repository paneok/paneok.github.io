with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the holiday carousel init function
import re
content = ''.join(lines)
matches = list(re.finditer(r'function\s+initHolidayCarousel|initHolidayPhotoCarousel|holiday-carousel|HOLIDAY_PHOTOS', content))
for m in matches[:3]:
    line_num = content[:m.start()].count('\n') + 1
    print(f"Found at line {line_num}: {content[m.start():m.start()+60]}")
