#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import json
from pathlib import Path

def merge_characters():
    """Объединить персонажей с цифрами в JSON файле"""
    
    # Загружаем данные
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    characters = data['characters']
    merged_characters = []
    used_ids = set()
    
    # Группируем персонажей для объединения
    groups_to_merge = {
        # Русалочка
        ('принцесса русалочка', 'принцесса русалочка'): [14, 79],
        
        # Эльза
        ('холодное сердце эльза', 'elsa'): [8],
        
        # Леди Баг
        ('леди баг', 'леди-баг'): [182, 183],
        
        # Пиратки
        ('пиратка', 'пиратка'): [230, 231],
        
        # Буба
        ('буба', 'буба'): [103],
        
        # Космонавт ж
        ('космонавт ж', 'космонавт-женский'): [15],
        
        # Скоморохи
        ('скоморох', 'скоморох'): [165, 166, 167, 168, 169],
        
        # Тедди
        ('тедди', 'тедди'): [238],
        
        # Эльфы
        ('эльф', 'эльф'): [190, 191, 192],
    }
    
    print("=== ОБЪЕДИНЕНИЕ ПЕРСОНАЖЕЙ ===")
    
    # Обрабатываем каждую группу для объединения
    for group_key, character_ids in groups_to_merge.items():
        group_name, group_slug = group_key
        
        # Ищем всех персонажей в группе
        group_characters = []
        for char in characters:
            if char['id'] in character_ids:
                group_characters.append(char)
                used_ids.add(char['id'])
        
        if len(group_characters) == 0:
            continue
            
        print(f"\\nОбъединяем группу: {group_name}")
        
        # Создаем объединенного персонажа
        main_character = group_characters[0]  # Берем первого как основу
        
        # Собираем все изображения в галерею
        all_images = []
        for char in group_characters:
            if char['images']['main'] not in all_images:
                all_images.append(char['images']['main'])
            for img in char['images']['gallery']:
                if img not in all_images:
                    all_images.append(img)
        
        # Создаем объединенного персонажа
        merged_character = {
            "id": main_character['id'],
            "name": main_character['name'],  # Оставляем оригинальное имя основного персонажа
            "slug": main_character['slug'],
            "category": main_character['category'],
            "emoji": main_character['emoji'],
            "images": {
                "main": all_images[0] if all_images else main_character['images']['main'],
                "gallery": all_images
            },
            "description": main_character['description'],
            "features": main_character['features'],
            "pricing": main_character['pricing'],
            "tags": main_character['tags'],
            "isPopular": main_character['isPopular'],
            "isNew": main_character['isNew']
        }
        
        merged_characters.append(merged_character)
        
        print(f"  ID {main_character['id']}: {main_character['name']}")
        print(f"  Галерея: {len(all_images)} изображений")
        for i, img in enumerate(all_images):
            print(f"    {i+1}: {img}")
    
    # Добавляем всех остальных персонажей, которые не были объединены
    for char in characters:
        if char['id'] not in used_ids:
            merged_characters.append(char)
    
    # Обновляем данные
    data['characters'] = merged_characters
    
    # Сохраняем обновленный JSON
    with open('data/characters-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\\n=== РЕЗУЛЬТАТ ===")
    print(f"Объединено групп: {len(groups_to_merge)}")
    print(f"Общее количество персонажей: {len(merged_characters)}")
    print("JSON файл обновлен!")
    
    return merged_characters

def manual_merge_princesses():
    """Ручное объединение принцесс с цифрами"""
    
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    characters = data['characters']
    
    # Находим принцесс с цифрами для объединения
    princess_groups = {}
    
    for char in characters:
        name = char['name'].lower()
        if 'принцесса' in name and any(c.isdigit() for c in char['images']['main']):
            # Извлекаем базовое имя без цифр
            base_name = re.sub(r'\s*\d+', '', name).strip()
            if base_name not in princess_groups:
                princess_groups[base_name] = []
            princess_groups[base_name].append(char)
    
    print("\\n=== ПОИСК ПРИНЦЕСС ДЛЯ ОБЪЕДИНЕНИЯ ===")
    for base_name, group in princess_groups.items():
        if len(group) > 1:
            print(f"\\nГруппа: {base_name}")
            for char in group:
                print(f"  ID {char['id']}: {char['name']}")
                print(f"    Изображение: {char['images']['main']}")

if __name__ == "__main__":
    # Сначала найдем всех принцесс для объединения
    manual_merge_princesses()
    
    # Затем объединим основные группы
    merge_characters()