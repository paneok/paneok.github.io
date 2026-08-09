import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

PROGRAMS_FILE = r"d:\Users\paneo\Documents\paneok.github.io-master\data\programs-data.json"

def main():
    print("🔍 Starting verification of programs-data.json...")
    
    if not os.path.exists(PROGRAMS_FILE):
        print(f"❌ Error: {PROGRAMS_FILE} not found!")
        sys.exit(1)
        
    try:
        with open(PROGRAMS_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)
    except Exception as e:
        print(f"❌ Error: Failed to parse JSON! {e}")
        sys.exit(1)
        
    programs = db.get("programs", [])
    print(f"✅ JSON is valid. Loaded {len(programs)} programs.")
    
    errors = 0
    warnings = 0
    
    required_fields = ["id", "name", "slug", "category", "emoji", "pricing", "description", "fullDescription", "images"]
    
    # Check fields and properties
    ids = set()
    for p in programs:
        p_id = p.get("id")
        p_name = p.get("name", "Unnamed")
        
        # Check unique IDs
        if p_id is None:
            print(f"❌ Error: Program '{p_name}' has no 'id'!")
            errors += 1
        elif p_id in ids:
            print(f"❌ Error: Duplicate ID {p_id} for program '{p_name}'!")
            errors += 1
        else:
            ids.add(p_id)
            
        # Check required fields
        for field in required_fields:
            if field not in p:
                print(f"❌ Error: Program '{p_name}' (ID {p_id}) is missing required field '{field}'!")
                errors += 1
                
        # Check pricing structure
        pricing = p.get("pricing", {})
        if "amount" not in pricing and not pricing.get("isCharacterPrice"):
            print(f"❌ Error: Program '{p_name}' (ID {p_id}) pricing is missing 'amount' field!")
            errors += 1
        if "unit" not in pricing:
            print(f"⚠️ Warning: Program '{p_name}' (ID {p_id}) pricing is missing 'unit' field!")
            warnings += 1
            
        # Check images structure
        images = p.get("images", {})
        if "main" not in images:
            print(f"❌ Error: Program '{p_name}' (ID {p_id}) images is missing 'main' field!")
            errors += 1
        else:
            main_path = images["main"]
            if main_path and not os.path.exists(os.path.join(r"d:\Users\paneo\Documents\paneok.github.io-master", main_path)):
                print(f"⚠️ Warning: Main image path '{main_path}' for program '{p_name}' does not exist on disk!")
                warnings += 1
                
        # Check gallery
        gallery = images.get("gallery", [])
        if not isinstance(gallery, list):
            print(f"❌ Error: Program '{p_name}' (ID {p_id}) images 'gallery' is not a list!")
            errors += 1
        else:
            for idx, img_path in enumerate(gallery):
                if not os.path.exists(os.path.join(r"d:\Users\paneo\Documents\paneok.github.io-master", img_path)):
                    print(f"⚠️ Warning: Gallery image path '{img_path}' for program '{p_name}' does not exist on disk!")
                    warnings += 1
                    
        # Check fullDescription format
        full_desc = p.get("fullDescription", "")
        if full_desc:
            lines = full_desc.split('\n')
            for line in lines:
                if line.strip() and not line.strip().startswith('-'):
                    print(f"ℹ️ Info: Non-bullet line in fullDescription for '{p_name}': '{line}'")
                    
    print(f"\n📊 Verification summary: {errors} errors, {warnings} warnings.")
    if errors > 0:
        print("❌ Verification failed!")
        sys.exit(1)
    else:
        print("🎉 Verification completed successfully!")

if __name__ == '__main__':
    main()
