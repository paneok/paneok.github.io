import os
from PIL import Image

def compress_images_in_dir(root_dir, max_dim=1400, quality=82):
    count = 0
    total_saved_bytes = 0
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png']:
                filepath = os.path.join(root, file)
                orig_size = os.path.getsize(filepath)
                
                # Only process files > 800 KB
                if orig_size > 800 * 1024:
                    try:
                        with Image.open(filepath) as img:
                            orig_format = img.format
                            w, h = img.size
                            
                            # Check if resize is needed
                            needs_resize = w > max_dim or h > max_dim
                            if needs_resize:
                                if w > h:
                                    new_w = max_dim
                                    new_h = int(h * (max_dim / float(w)))
                                else:
                                    new_h = max_dim
                                    new_w = int(w * (max_dim / float(h)))
                                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                            
                            if ext in ['.jpg', '.jpeg']:
                                if img.mode != 'RGB':
                                    img = img.convert('RGB')
                                img.save(filepath, 'JPEG', quality=quality, optimize=True)
                            elif ext == '.png':
                                # Optimize PNG
                                if img.mode == 'RGBA':
                                    img.save(filepath, 'PNG', optimize=True)
                                else:
                                    img.save(filepath, 'PNG', optimize=True)
                                    
                        new_size = os.path.getsize(filepath)
                        saved = orig_size - new_size
                        if saved > 0:
                            total_saved_bytes += saved
                            count += 1
                    except Exception as e:
                        print(f"Error processing {filepath}: {e}")

    print(f"Done! Compressed {count} images. Saved {total_saved_bytes / (1024*1024):.2f} MB in total.")

if __name__ == '__main__':
    compress_images_in_dir('images')
