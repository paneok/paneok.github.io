#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
from collections import defaultdict
from pathlib import Path

def analyze_gallery_duplicates():
    """Анализ галерей персонажей для поиска потенциальных дубликатов"""
    
    # Загружаем данные
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    characters = data['characters']
    
    print("=== АНАЛИЗ ГАЛЕРЕЙ ПЕРСОНАЖЕЙ ===")
    print(f"Всего персонажей: {len(characters)}")
    
    # Ищем персонажей с большими галереями
    multi_image_characters = []
    
    for char in characters:
        gallery_size = len(char['images']['gallery'])
        if gallery_size > 1:
            multi_image_characters.append({
                'id': char['id'],
                'name': char['name'],
                'gallery_size': gallery_size,
                'main_image': char['images']['main'],
                'gallery': char['images']['gallery']
            })
    
    print(f"\\nПерсонажи с несколькими изображениями в галерее: {len(multi_image_characters)}")
    
    # Группируем по базовым именам для поиска потенциальных дубликатов
    name_groups = defaultdict(list)
    
    for char in characters:
        name = char['name'].lower().strip()
        # Удаляем цифры из имени для группировки
        import re
        clean_name = re.sub(r'\\d+', '', name).strip()
        name_groups[clean_name].append(char)
    
    # Ищем группы с похожими именами
    potential_duplicates = []
    
    for clean_name, group in name_groups.items():
        if len(group) > 1:
            # Проверяем, имеют ли персонажи одинаковые изображения
            all_images = set()
            for char in group:
                all_images.add(char['images']['main'])
                all_images.update(char['images']['gallery'])
            
            # Если у персонажей есть общие изображения, это потенциальные дубликаты
            common_images = []
            for char in group:
                for img in char['images']['gallery']:
                    if img in [c['images']['main'] for c in group] or img in [gi for c in group for gi in c['images']['gallery'] if gi != img]:
                        if img not in common_images:
                            common_images.append(img)
            
            if common_images:
                potential_duplicates.append({
                    'clean_name': clean_name,
                    'characters': group,
                    'common_images': common_images
                })
    
    print(f"\\nПотенциальные дубликаты (персонажи с похожими именами): {len(potential_duplicates)}")
    
    for dup_group in potential_duplicates:
        print(f"\\nГруппа: {dup_group['clean_name']}")
        for char in dup_group['characters']:
            print(f"  ID {char['id']}: {char['name']}")
            print(f"    Основное изображение: {char['images']['main']}")
            print(f"    Галерея: {char['images']['gallery']}")
    
    # Анализ изображений, которые используются несколько раз
    image_usage = defaultdict(list)
    
    for char in characters:
        image_usage[char['images']['main']].append({
            'id': char['id'],
            'name': char['name'],
            'role': 'main'
        })
        
        for img in char['images']['gallery']:
            image_usage[img].append({
                'id': char['id'],
                'name': char['name'],
                'role': 'gallery'
            })
    
    # Ищем изображения, которые используются несколькими персонажами
    shared_images = {img: chars for img, chars in image_usage.items() if len(chars) > 1}
    
    print(f"\\nИзображения, используемые несколькими персонажами: {len(shared_images)}")
    
    for img_path, chars in shared_images.items():
        print(f"\\nИзображение: {img_path}")
        for char_info in chars:
            print(f"  ID {char_info['id']}: {char_info['name']} ({char_info['role']})")
    
    # Создаем отчет
    report = {
        'total_characters': len(characters),
        'multi_image_characters': multi_image_characters,
        'potential_duplicates': potential_duplicates,
        'shared_images': [{'image': img, 'characters': chars} for img, chars in shared_images.items()]
    }
    
    # Сохраняем отчет
    with open('gallery_analysis_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\\nОтчет сохранен в gallery_analysis_report.json")
    
    return report

def find_exact_duplicates():
    """Поиск точных дубликатов по изображениям"""
    
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    characters = data['characters']
    
    print("\\n=== ПОИСК ТОЧНЫХ ДУБЛИКАТОВ ===")
    
    # Группируем по основному изображению
    image_groups = defaultdict(list)
    
    for char in characters:
        main_img = char['images']['main']
        image_groups[main_img].append(char)
    
    # Ищем группы с несколькими персонажами
    exact_duplicates = []
    
    for img_path, chars in image_groups.items():
        if len(chars) > 1:
            exact_duplicates.append({
                'image': img_path,
                'characters': chars
            })
    
    print(f"Найдено {len(exact_duplicates)} групп точных дубликатов:")
    
    for dup_group in exact_duplicates:
        print(f"\\nИзображение: {dup_group['image']}")
        for char in dup_group['characters']:
            print(f"  ID {char['id']}: {char['name']}")
    
    return exact_duplicates

if __name__ == "__main__":
    report = analyze_gallery_duplicates()
    exact_dups = find_exact_duplicates()