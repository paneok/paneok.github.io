import os
from PIL import Image

def find_large_images(root_dir, size_limit_mb=1.0):
    large_files = []
    limit_bytes = size_limit_mb * 1024 * 1024
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png']:
                filepath = os.path.join(root, file)
                size = os.path.getsize(filepath)
                if size > limit_bytes:
                    large_files.append((filepath, size))
                    
    large_files.sort(key=lambda x: x[1], reverse=True)
    return large_files

if __name__ == '__main__':
    images_dir = 'images'
    large_files = find_large_images(images_dir, size_limit_mb=1.0)
    print(f"Found {len(large_files)} images larger than 1 MB:")
    for path, size in large_files[:15]:
        print(f"  {path}: {size / (1024*1024):.2f} MB")
