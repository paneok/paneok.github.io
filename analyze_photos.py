#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import json
from pathlib import Path

def find_photos_with_numbers():
    """Найти все фотографии, оканчивающиеся цифрами"""
    catalog_path = Path("images/catalog")
    photos_with_numbers = []
    
    # Ищем файлы с цифрами в конце имени
    for file_path in catalog_path.iterdir():
        if file_path.is_file():
            filename = file_path.name
            # Ищем файлы, оканчивающиеся цифрой перед расширением
            match = re.search(r'(\d+)\.(png|jpg|jpeg|JPG|PNG|JPEG)$', filename)
            if match:
                number = int(match.group(1))
                name_without_number = re.sub(r'\s*\d+\.(png|jpg|jpeg|JPG|PNG|JPEG)$', '', filename)
                photos_with_numbers.append({
                    'filename': filename,
                    'number': number,
                    'name_base': name_without_number.strip(),
                    'full_path': str(file_path)
                })
    
    return photos_with_numbers

def group_similar_characters(photos):
    """Группировать похожих персонажей по базовому имени"""
    groups = {}
    
    for photo in photos:
        # Упрощенное базовое имя для группировки
        base_name = photo['name_base'].lower()
        
        # Специальные правила для группировки
        if 'русалочка' in base_name:
            base_key = 'принцесса русалочка'
        elif 'буба' in base_name:
            base_key = 'буба'
        elif 'космонавт' in base_name:
            base_key = 'космонавт'
        elif 'клоун' in base_name:
            base_key = 'клоун'
        elif 'серебро' in base_name and 'пайетка' in base_name:
            base_key = 'ведущая серебро пайетка'
        elif 'серебро' in base_name:
            base_key = 'ведущая серебро'
        elif 'диско' in base_name and 'женский' in base_name:
            base_key = 'ведущий диско женский'
        elif 'эльза' in base_name:
            base_key = 'эльза'
        elif 'хаги ваги' in base_name:
            base_key = 'хаги ваги'
        elif 'леди баг' in base_name:
            base_key = 'леди баг'
        elif 'скоморох' in base_name:
            base_key = 'скоморох'
        elif 'тедди' in base_name:
            base_key = 'тедди'
        elif 'три кота' in base_name:
            base_key = 'три кота'
        elif 'черепашка' in base_name:
            base_key = 'черепашка'
        elif 'принцесса' in base_name and ('золотая' in base_name or 'рапунцель' in base_name):
            base_key = base_name
        else:
            base_key = base_name
            
        if base_key not in groups:
            groups[base_key] = []
        groups[base_key].append(photo)
    
    return groups

def analyze_current_json():
    """Анализ текущего JSON файла"""
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("=== АНАЛИЗ ТЕКУЩИХ ДАННЫХ ===")
    
    # Ищем персонажей, которые могут быть объединены
    characters_to_merge = []
    
    for character in data['characters']:
        name = character['name'].lower()
        main_image = character['images']['main']
        
        # Ищем персонажей с цифрами в названии или изображениях
        has_number_in_name = bool(re.search(r'\d+', name))
        has_number_in_image = bool(re.search(r'\d+', main_image))
        
        if has_number_in_name or has_number_in_image:
            characters_to_merge.append({
                'id': character['id'],
                'name': character['name'],
                'slug': character['slug'],
                'main_image': main_image,
                'gallery': character['images']['gallery']
            })
    
    return characters_to_merge

def main():
    print("=== ПОИСК ФОТОГРАФИЙ С ЦИФРАМИ ===")
    photos = find_photos_with_numbers()
    
    print(f"Найдено {len(photos)} фотографий с цифрами:")
    for photo in sorted(photos, key=lambda x: (x['name_base'], x['number'])):
        print(f"  {photo['filename']}")
    
    print("\n=== ГРУППИРОВКА ПЕРСОНАЖЕЙ ===")
    groups = group_similar_characters(photos)
    
    for group_name, group_photos in sorted(groups.items()):
        if len(group_photos) > 1:
            print(f"\nГруппа: {group_name}")
            for photo in sorted(group_photos, key=lambda x: x['number']):
                print(f"  {photo['number']}: {photo['filename']}")
    
    print("\n=== АНАЛИЗ ТЕКУЩИХ ДАННЫХ JSON ===")
    characters_to_merge = analyze_current_json()
    
    print(f"Найдено {len(characters_to_merge)} персонажей для потенциального объединения:")
    for char in characters_to_merge:
        print(f"  ID {char['id']}: {char['name']}")
        print(f"    Основное изображение: {char['main_image']}")
        print(f"    Галерея: {char['gallery']}")
        print()

if __name__ == "__main__":
    main()