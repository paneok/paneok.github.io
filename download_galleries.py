import asyncio
import os
import re
import sys
import json
import urllib.request
import urllib.parse
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"d:\Users\paneo\Documents\paneok.github.io-master"
VK_FILE = os.path.join(WORKSPACE, "data", "vk-services-detailed.json")
OUTPUT_DIR = os.path.join(WORKSPACE, "images", "vk_services")

os.makedirs(OUTPUT_DIR, exist_ok=True)

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

def get_base_url(url_str):
    if not url_str:
        return ""
    return url_str.split('?')[0]

async def download_image(url, local_path, title):
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        # Using a timeout of 15 seconds for downloading each image
        with urllib.request.urlopen(req, timeout=15) as response:
            with open(local_path, 'wb') as img_f:
                img_f.write(response.read())
        print(f"  [IMAGE SUCCESS] Saved: {os.path.basename(local_path)}")
        return True
    except Exception as e:
        print(f"  [IMAGE ERROR] Failed to download {url} for '{title}': {e}")
        return False

async def process_service(context, service, sem):
    async with sem:
        title = service['title']
        url = service['url']
        slug = transliterate(title)
        print(f"\n[START] Fetching gallery for: {title}...")
        
        try:
            page = await context.new_page()
            # Wait for networkidle state
            await page.goto(url, wait_until='networkidle', timeout=30000)
            # Sleep 3 seconds to let DOM load fully
            await page.wait_for_timeout(3000)
            
            # Find all image tags
            images_locator = page.locator('img')
            count = await images_locator.count()
            
            unique_base_urls = set()
            gallery_urls = []
            
            for i in range(count):
                img = images_locator.nth(i)
                src = await img.get_attribute('src') or ''
                classes = await img.get_attribute('class') or ''
                
                # Filter criteria: must contain userapi.com and represent product image
                # In VK, product images have class 'vkuiImageBase__imgObjectFitCover' or similar.
                if 'userapi.com' in src and ('vkuiImageBase__img' in classes or 'market' in src or 'bu' in src):
                    base_url = get_base_url(src)
                    if base_url and base_url not in unique_base_urls:
                        unique_base_urls.add(base_url)
                        gallery_urls.append(src)
            
            await page.close()
            
            print(f"  Found {len(gallery_urls)} unique gallery image(s) for '{title}'")
            
            # Download images
            gallery_local_paths = []
            for index, img_url in enumerate(gallery_urls):
                if index == 0:
                    filename = f"{slug}.jpg"
                else:
                    filename = f"{slug}_{index}.jpg"
                    
                local_path = os.path.join(OUTPUT_DIR, filename)
                rel_path = f"images/vk_services/{filename}"
                
                # Check if image already exists to avoid double downloading
                if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
                    print(f"  [IMAGE SKIP] Already exists: {filename}")
                    gallery_local_paths.append(rel_path)
                else:
                    success = await download_image(img_url, local_path, title)
                    if success:
                        gallery_local_paths.append(rel_path)
            
            # Update detailed record
            service['gallery_local_paths'] = gallery_local_paths
            if gallery_local_paths:
                service['image_filename'] = os.path.basename(gallery_local_paths[0])
                
            print(f"[SUCCESS] Finished: {title} ({len(gallery_local_paths)} images linked)")
            
        except Exception as e:
            print(f"[FAILED] Fetching gallery for: {title}. Error: {e}")
            # Fallback if page loads fail, check if we have the main image at least
            fallback_filename = f"{slug}.jpg"
            fallback_path = os.path.join(OUTPUT_DIR, fallback_filename)
            if os.path.exists(fallback_path) and os.path.getsize(fallback_path) > 0:
                service['gallery_local_paths'] = [f"images/vk_services/{fallback_filename}"]
                service['image_filename'] = fallback_filename
            else:
                service['gallery_local_paths'] = []

async def main():
    if not os.path.exists(VK_FILE):
        print(f"Error: {VK_FILE} does not exist!")
        return
        
    with open(VK_FILE, 'r', encoding='utf-8') as f:
        services = json.load(f)
        
    print(f"Loaded {len(services)} services from detailed file. Starting gallery extraction...")
    
    # Process with 4 concurrent workers to be fast yet stable
    sem = asyncio.Semaphore(4)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 1000},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        tasks = [process_service(context, service, sem) for service in services]
        await asyncio.gather(*tasks)
        
        await browser.close()
        
    # Write back the updated data
    with open(VK_FILE, 'w', encoding='utf-8') as f:
        json.dump(services, json_f := f, ensure_ascii=False, indent=2)
        
    print(f"\nAll gallery image downloading completed! Updated detailed records saved to: {VK_FILE}")

if __name__ == '__main__':
    asyncio.run(main())
