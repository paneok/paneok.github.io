import json
import os
import re
import sys
import shutil

sys.stdout.reconfigure(encoding='utf-8')

# Paths
WORKSPACE = r"d:\Users\paneo\Documents\paneok.github.io-master"
PROGRAMS_FILE = os.path.join(WORKSPACE, "data", "programs-data.json")
VK_DETAILED_FILE = os.path.join(WORKSPACE, "data", "vk-services-detailed.json")
BACKUP_FILE = os.path.join(WORKSPACE, "data", "programs-data.json.bak")

EXISTING_MAP = {
    "Анимационная программа СТАНДАРТ": 1,
    "Блоггерская вечеринка": 2,
    "Челлендж Пати": 4, # Matches ID 4 "Челлендж party"
    "Шоу мыльных пузырей": 5,
    "Научное шоу": 6,
    "Фокусник": 9, # Matches ID 9 "Иллюзионное шоу / Фокусник"
    "Азотное мороженное": 10, # Matches ID 10 "Азотное мороженое"
    "Роспись значков/магнитиков": 11, # Matches ID 11 "Роспись деревянных значков/магнитиков"
    "Слаймы": 12,
    "Декор футболок": 13, # Matches ID 13 "Роспись футболок"
    "Декор шоппера": 15, # Matches ID 15 "Роспись шопперов"
    "Роспись кепок": 16,
    "Дискотека в серебре": 17, # Matches ID 17 "Дискотека в серебре / фольге"
    "Цветная дискотека": 18,
    "Неоновая вечеринка": 19, # Matches ID 19 "Neon - Party"
    "Поролоновая вечеринка": 20, # Matches ID 20 "Поролон Party"
    "Майнкрафт": 21,
    "Among Us": 22,
    "Поп ип вечеринка": 23, # Matches ID 23 "Pop It - party"
    "Сахарное бурито": 25,
    "Сахарная вата": 26
}

NEW_PROGRAMS_DETAILS = {
    "Интерактивный спектакль Веселая ферма": {
        "slug": "veselaya-ferma",
        "category": "animation",
        "emoji": "🚜",
        "defaultCharacterId": 338,
        "targetAge": "2-6 лет"
    },
    "Академия Невермор": {
        "slug": "nevermore-academy",
        "category": "active",
        "emoji": "🔮",
        "defaultCharacterId": 239,
        "targetAge": "7-12 лет"
    },
    "Игра в кальмара": {
        "slug": "squid-game",
        "category": "games",
        "emoji": "🦑",
        "defaultCharacterId": 132,
        "targetAge": "10+ лет"
    },
    "В стране единорогов": {
        "slug": "unicorn-land",
        "category": "animation",
        "emoji": "🦄",
        "defaultCharacterId": 10,
        "targetAge": "3-8 лет"
    },
    "Сладкое королевство": {
        "slug": "sweet-kingdom",
        "category": "food",
        "emoji": "🍩",
        "defaultCharacterId": 248,
        "targetAge": "5-10 лет"
    },
    "Форт Боярд": {
        "slug": "fort-boyard",
        "category": "games",
        "emoji": "🗝️",
        "defaultCharacterId": 340,
        "targetAge": "6+ лет"
    },
    "К-ПОП охотницы на демонов": {
        "slug": "k-pop-demon-hunters",
        "category": "party",
        "emoji": "🎤",
        "defaultCharacterId": None,
        "targetAge": "8-14 лет"
    },
    "Проделки Лабубу: В Поисках Сюрпризов!": {
        "slug": "labubu-pranks",
        "category": "creative",
        "emoji": "🧸",
        "defaultCharacterId": 361,
        "targetAge": "5-9 лет"
    },
    "Бьюти вечеринка": {
        "slug": "beauty-party",
        "category": "party",
        "emoji": "💅",
        "defaultCharacterId": None,
        "targetAge": "6-12 лет"
    },
    "Праздник для самых маленьких": {
        "slug": "toddlers-party",
        "category": "animation",
        "emoji": "👶",
        "defaultCharacterId": None,
        "targetAge": "1-4 года"
    },
    "Аквагрим": {
        "slug": "face-painting",
        "category": "creative",
        "emoji": "🎨",
        "defaultCharacterId": 360,
        "targetAge": "3+ лет"
    },
    "Бьюти-бар на Welcome зону": {
        "slug": "beauty-bar",
        "category": "party",
        "emoji": "💄",
        "defaultCharacterId": 360,
        "targetAge": "5+ лет"
    },
    "Шейкер шоу": {
        "slug": "shaker-show",
        "category": "food",
        "emoji": "🥤",
        "defaultCharacterId": 361,
        "targetAge": "5+ лет"
    }
}

def parse_price(price_str):
    price_str = price_str.replace('\xa0', ' ').strip()
    is_hourly = 'hour' in price_str or 'час' in price_str or '/ hour' in price_str or '/час' in price_str
    unit = '₽/час' if is_hourly else '₽'
    
    numbers = re.findall(r'\d[\d\s,\.]*', price_str)
    if numbers:
        first_num_str = re.sub(r'[\s,\.]', '', numbers[0])
        try:
            amount = int(first_num_str)
        except ValueError:
            amount = 0
    else:
        amount = 0
        
    return amount, unit

def clean_description(text):
    if not text:
        return "", ""
    
    # Pre-clean known VK artifacts
    text = text.replace("Show\xa0more", "").replace("Show more", "")
    text = text.replace('""', '"')
    
    # Strip common footers
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        l = line.strip()
        # Skip order footer lines
        if any(keyword in l.lower() for keyword in ["для заказа", "в личные сообщения", "по телефону", "звоните:", "+7", "☎", "для мастер-класса потребуются", "появились вопросы", "стоимость до"]):
            continue
        cleaned_lines.append(line)
        
    text = '\n'.join(cleaned_lines).strip()
    
    # Let's extract paragraphs and bullet points
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    intro = ""
    bullets = []
    
    for l in lines:
        if l.startswith('-') or l.startswith('•') or l.startswith('✨') or l.startswith('🕦') or l.startswith('—') or l.startswith('💎') or l.startswith('🌟'):
            bullet_text = re.sub(r'^[\-•✨🕦—💎🌟]\s*', '', l).strip()
            if bullet_text:
                bullets.append("- " + bullet_text)
        elif l.startswith('Вас ждут:') or l.startswith('В программе:') or l.startswith('В составе') or l.startswith('Продолжительность') or l.startswith('Каждый участник'):
            continue
        else:
            if not intro:
                intro = l
            else:
                if len(intro) + len(l) < 150:
                    intro += " " + l
                else:
                    bullets.append("- " + l)
                    
    if not intro and bullets:
        intro = bullets[0].replace("- ", "")
        
    if not bullets:
        sentences = re.split(r'(?<=[.!?])\s+', intro)
        if len(sentences) > 1:
            intro = sentences[0]
            bullets = ["- " + s for s in sentences[1:] if s]
        else:
            bullets = ["- " + intro]
            
    short_desc = intro.strip().strip('"').strip("'").strip()
    if len(short_desc) > 150:
        short_desc = short_desc[:147]
        last_space = short_desc.rfind(' ')
        if last_space != -1:
            short_desc = short_desc[:last_space] + '...'
        else:
            short_desc = short_desc + '...'
            
    full_desc = '\n'.join(bullets)
    return short_desc, full_desc

def main():
    print("🚀 Starting Site Database Update script...")
    
    # Load VK detailed services
    if not os.path.exists(VK_DETAILED_FILE):
        print(f"❌ Error: {VK_DETAILED_FILE} not found!")
        return
    with open(VK_DETAILED_FILE, 'r', encoding='utf-8') as f:
        vk_services = json.load(f)
    print(f"Loaded {len(vk_services)} services from VK data.")
    
    vk_by_title = {s['title']: s for s in vk_services}
    
    # Load current programs
    if not os.path.exists(PROGRAMS_FILE):
        print(f"❌ Error: {PROGRAMS_FILE} not found!")
        return
        
    # Backup
    shutil.copy2(PROGRAMS_FILE, BACKUP_FILE)
    print(f"💾 Created database backup at: {BACKUP_FILE}")
    
    with open(PROGRAMS_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    programs = db.get("programs", [])
    print(f"Loaded {len(programs)} existing programs from website database.")
    
    # Map to track modified programs
    modified_count = 0
    
    for p in programs:
        p_id = p['id']
        # Find matching VK service
        vk_title = next((k for k, v in EXISTING_MAP.items() if v == p_id), None)
        
        # Specific custom logic for ID 6 (Science Show)
        if p_id == 6:
            vk_main = vk_by_title.get("Научное шоу")
            vk_cryo = vk_by_title.get("Научное крио шоу")
            vk_nitro = vk_by_title.get("Научное азотное шоу")
            
            if vk_main:
                short_desc, full_desc = clean_description(vk_main['description'])
                p['description'] = short_desc
                p['fullDescription'] = full_desc
                amount, unit = parse_price(vk_main['price'])
                p['pricing']['amount'] = amount
                p['pricing']['unit'] = unit
                
                if vk_main.get('gallery_local_paths'):
                    p['images'] = {
                        "main": vk_main['gallery_local_paths'][0],
                        "gallery": vk_main['gallery_local_paths']
                    }
                    p['image'] = "" # legacy fallback
                    
            # Setup variants
            if 'variants' in p['pricing']:
                for variant in p['pricing']['variants']:
                    if variant['type'] == 'chemical':
                        variant['price'] = 7000
                    elif variant['type'] == 'cryo' and vk_cryo:
                        amount, _ = parse_price(vk_cryo['price'])
                        variant['price'] = amount
                    elif variant['type'] == 'nitrogen' and vk_nitro:
                        amount, _ = parse_price(vk_nitro['price'])
                        variant['price'] = amount
            
            print(f"✏️ Updated scientific program (ID 6) and its variants: Chemical, Cryo, Nitrogen")
            modified_count += 1
            continue
            
        if vk_title and vk_title in vk_by_title:
            vk = vk_by_title[vk_title]
            
            # Clean description
            short_desc, full_desc = clean_description(vk['description'])
            p['description'] = short_desc
            p['fullDescription'] = full_desc
            
            # Parse price
            amount, unit = parse_price(vk['price'])
            if 'pricing' not in p:
                p['pricing'] = {}
            p['pricing']['amount'] = amount
            p['pricing']['unit'] = unit
            p['pricing']['isCharacterPrice'] = False # Keep as False since we have explicit VK price
            
            # Specific logic for ID 9 variants
            if p_id == 9 and 'variants' in p['pricing']:
                for variant in p['pricing']['variants']:
                    if variant['type'] == 'standard':
                        variant['price'] = 10000
                    elif variant['type'] == 'extended':
                        variant['price'] = 12000
            
            # Images
            if vk.get('gallery_local_paths'):
                p['images'] = {
                    "main": vk['gallery_local_paths'][0],
                    "gallery": vk['gallery_local_paths']
                }
                p['image'] = "" # legacy fallback
                
            print(f"✏️ Updated existing program: {p['name']} (ID {p_id}) -> price {amount}{unit}")
            modified_count += 1
            
    # Add new programs
    new_count = 0
    next_id = max(p['id'] for p in programs) + 1 if programs else 1
    if next_id < 27:
        next_id = 27
        
    for title, details in NEW_PROGRAMS_DETAILS.items():
        if title in vk_by_title:
            vk = vk_by_title[title]
            
            short_desc, full_desc = clean_description(vk['description'])
            amount, unit = parse_price(vk['price'])
            
            images_obj = {
                "main": "images/catalog/placeholder.png",
                "gallery": []
            }
            if vk.get('gallery_local_paths'):
                images_obj = {
                    "main": vk['gallery_local_paths'][0],
                    "gallery": vk['gallery_local_paths']
                }
                
            new_p = {
                "id": next_id,
                "name": title,
                "slug": details['slug'],
                "category": details['category'],
                "emoji": details['emoji'],
                "pricing": {
                    "amount": amount,
                    "unit": unit,
                    "isCharacterPrice": False
                },
                "defaultCharacterId": details['defaultCharacterId'],
                "description": short_desc,
                "fullDescription": full_desc,
                "bonus": "Подарки и сюрпризы каждому участнику!",
                "duration": "1 час",
                "targetAge": details['targetAge'],
                "image": "",
                "images": images_obj,
                "requiresCharacter": True
            }
            
            programs.append(new_p)
            print(f"🆕 Added new program: {title} (ID {next_id}) -> price {amount}{unit}")
            next_id += 1
            new_count += 1
            
    # Sort programs by ID
    programs.sort(key=lambda x: x['id'])
    db['programs'] = programs
    
    # Save back to file
    with open(PROGRAMS_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        
    print(f"🎉 Successfully updated {modified_count} programs and added {new_count} new programs!")
    print(f"Saved database to: {PROGRAMS_FILE}")

if __name__ == '__main__':
    main()
