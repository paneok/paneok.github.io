import json
import os
import re
import sys
import shutil

sys.stdout.reconfigure(encoding='utf-8')

# Paths
WORKSPACE = r"d:\Users\paneo\Documents\paneok.github.io-master"
PROGRAMS_FILE = os.path.join(WORKSPACE, "data", "programs-data.json")
BACKUP_FILE = os.path.join(WORKSPACE, "data", "programs-data.json.bak")
VK_DETAILED_FILE = os.path.join(WORKSPACE, "data", "vk-services-detailed.json")
IMG_DIR = os.path.join(WORKSPACE, "images", "vk_services")

# Raccoon size configuration
RACCOON_SIZE = 9595

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

def transliterate(text):
    cyrillic = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
    latin = ['a','b','v','g','d','e','yo','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','ts','ch','sh','shch','','y','','e','yu','ya']
    tr_map = {c: l for c, l in zip(cyrillic, latin)}
    text = text.lower()
    res = []
    for char in text:
        if char in tr_map:
            res.append(tr_map[char])
        elif char.isalnum():
            res.append(char)
        elif char in [' ', '_', '-']:
            res.append('_')
    res_str = ''.join(res)
    res_str = re.sub(r'_+', '_', res_str).strip('_')
    return res_str if res_str else "service_item"

def main():
    print("🚀 Starting Database and Disk Recovery Migration...")
    
    # ----------------------------------------------------
    # STEP 1: CLEAN UP VK-SERVICES-DETAILED.JSON
    # ----------------------------------------------------
    print("\n--- Step 1: Cleaning up VK Services Detailed JSON ---")
    if not os.path.exists(VK_DETAILED_FILE):
        print(f"❌ Error: {VK_DETAILED_FILE} not found!")
        sys.exit(1)
        
    with open(VK_DETAILED_FILE, 'r', encoding='utf-8') as f:
        vk_services = json.load(f)
        
    vk_by_title = {}
    for s in vk_services:
        title = s['title']
        slug = transliterate(title)
        
        # Check if local paths are empty
        local_paths = s.get('gallery_local_paths', [])
        main_filename = f"{slug}.jpg"
        main_path_disk = os.path.join(IMG_DIR, main_filename)
        
        if not local_paths:
            if os.path.exists(main_path_disk) and os.path.getsize(main_path_disk) > 0:
                print(f"  💡 Recovered empty paths for service '{title}' using existing disk file '{main_filename}'")
                local_paths = [f"images/vk_services/{main_filename}"]
            else:
                print(f"  ⚠️ Service '{title}' has no gallery and no '{main_filename}' on disk!")
                local_paths = []
                
        # Clean paths (filter out raccoon logos by size)
        cleaned_paths = []
        for path in local_paths:
            full_path = os.path.join(WORKSPACE, path)
            if os.path.exists(full_path):
                if os.path.getsize(full_path) == RACCOON_SIZE:
                    print(f"  🦝 Filtered out raccoon logo reference: '{path}'")
                else:
                    cleaned_paths.append(path)
            else:
                # If file doesn't exist, keep it if it is not a raccoon pattern (should not happen based on our check)
                if "_1.jpg" not in path:
                    cleaned_paths.append(path)
                    
        s['gallery_local_paths'] = cleaned_paths
        if cleaned_paths:
            s['local_main_path'] = cleaned_paths[0] # Ensure main path matches first clean image
            s['image_filename'] = os.path.basename(cleaned_paths[0])
        else:
            s['local_main_path'] = None
            s['image_filename'] = None
            
        vk_by_title[title] = s
        
    # Write back clean VK detailed json
    with open(VK_DETAILED_FILE, 'w', encoding='utf-8') as f:
        json.dump(vk_services, f, ensure_ascii=False, indent=2)
    print("✅ Cleaned vk-services-detailed.json saved successfully.")

    # ----------------------------------------------------
    # STEP 2: PHYSICAL DISK CLEANUP OF RACCOON FILES
    # ----------------------------------------------------
    print("\n--- Step 2: Deleting raccoon logo files from disk ---")
    deleted_count = 0
    if os.path.exists(IMG_DIR):
        for filename in os.listdir(IMG_DIR):
            path = os.path.join(IMG_DIR, filename)
            if os.path.isfile(path):
                if os.path.getsize(path) == RACCOON_SIZE:
                    try:
                        os.remove(path)
                        print(f"  🗑️ Deleted raccoon logo image: '{filename}'")
                        deleted_count += 1
                    except Exception as e:
                        print(f"  ❌ Error deleting file {filename}: {e}")
    print(f"✅ Physical cleanup complete. Deleted {deleted_count} files from disk.")

    # ----------------------------------------------------
    # STEP 3: REBUILD PROGRAMS-DATA.JSON
    # ----------------------------------------------------
    print("\n--- Step 3: Rebuilding programs-data.json ---")
    if not os.path.exists(BACKUP_FILE):
        print(f"❌ Error: Backup database file {BACKUP_FILE} not found! Cannot restore original main images.")
        sys.exit(1)
        
    with open(BACKUP_FILE, 'r', encoding='utf-8') as f:
        bak_db = json.load(f)
        
    if not os.path.exists(PROGRAMS_FILE):
        print(f"❌ Error: Current database file {PROGRAMS_FILE} not found!")
        sys.exit(1)
        
    with open(PROGRAMS_FILE, 'r', encoding='utf-8') as f:
        cur_db = json.load(f)
        
    bak_progs = {p['id']: p for p in bak_db.get('programs', [])}
    cur_progs = cur_db.get('programs', [])
    
    rebuilt_programs = []
    
    # Reverse EXISTING_MAP to map ID -> VK title
    id_to_vk_title = {v: k for k, v in EXISTING_MAP.items()}
    
    for p in cur_progs:
        pid = p['id']
        name = p['name']
        
        if pid <= 26 and pid in bak_progs:
            # Existing program: Restore original main image and gallery, then append VK photos
            bak_p = bak_progs[pid]
            
            orig_main = bak_p.get('images', {}).get('main')
            orig_gallery = list(bak_p.get('images', {}).get('gallery', []))
            
            print(f"✏️ Processing existing program ID {pid} ('{name}'):")
            print(f"  -> Restoring original main image: '{orig_main}'")
            
            # Rebuild images block
            p['images'] = {
                "main": orig_main,
                "gallery": orig_gallery
            }
            
            # Find matching VK service to append images to gallery
            vk_title = id_to_vk_title.get(pid)
            if not vk_title:
                # Try exact name match
                vk_title = next((t for t in vk_by_title.keys() if t.lower() == name.lower()), None)
                
            if vk_title and vk_title in vk_by_title:
                vk = vk_by_title[vk_title]
                vk_paths = vk.get('gallery_local_paths', [])
                
                print(f"  -> Appending {len(vk_paths)} clean VK images to gallery...")
                
                # Append clean VK images uniquely
                for path in vk_paths:
                    if path not in p['images']['gallery']:
                        p['images']['gallery'].append(path)
            else:
                print("  -> No matching VK service found to append images.")
                
            p['image'] = "" # legacy fallback empty
            
        else:
            # New program (ID >= 27)
            print(f"🆕 Processing new program ID {pid} ('{name}'):")
            
            # Find matching VK service
            vk_title = next((t for t in vk_by_title.keys() if t.lower() == name.lower()), None)
            if vk_title and vk_title in vk_by_title:
                vk = vk_by_title[vk_title]
                vk_paths = vk.get('gallery_local_paths', [])
                
                if vk_paths:
                    p['images'] = {
                        "main": vk_paths[0],
                        "gallery": vk_paths
                    }
                    print(f"  -> Assigned main image: '{vk_paths[0]}' and gallery ({len(vk_paths)} items)")
                else:
                    p['images'] = {
                        "main": "images/catalog/placeholder.png",
                        "gallery": []
                    }
                    print("  ⚠️ No clean images found. Assigned placeholder.png")
            else:
                p['images'] = {
                    "main": "images/catalog/placeholder.png",
                    "gallery": []
                }
                print("  ⚠️ No matching VK service found. Assigned placeholder.png")
                
            p['image'] = "" # legacy fallback empty
            
        rebuilt_programs.append(p)
        
    # Sort and save
    rebuilt_programs.sort(key=lambda x: x['id'])
    cur_db['programs'] = rebuilt_programs
    
    with open(PROGRAMS_FILE, 'w', encoding='utf-8') as f:
        json.dump(cur_db, f, ensure_ascii=False, indent=2)
        
    print("\n✅ Rebuilt programs-data.json saved successfully.")
    print("🎉 Database migration and cleanup completed perfectly!")

if __name__ == '__main__':
    main()
