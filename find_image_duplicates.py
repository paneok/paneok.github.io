#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from collections import defaultdict

def find_duplicate_images():
    """Найти персонажей с одинаковыми путями к изображениям"""

    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Тип data: {type(data)}")
    if isinstance(data, dict):
        print(f"Ключи: {list(data.keys())}")
        characters = data.get('characters', [])
    elif isinstance(data, list):
        characters = data
    else:
        print("Неизвестная структура JSON")
        return

    # Группируем персонажей по image.main
    image_groups = defaultdict(list)

    for character in characters:
        main_image = character.get('images', {}).get('main', '')
        if main_image:
            image_groups[main_image].append({
                'id': character['id'],
                'name': character['name'],
                'slug': character['slug']
            })

    print("=== ПЕРСОНАЖИ С ОДИНАКОВЫМИ ИЗОБРАЖЕНИЯМИ ===")

    duplicates_found = False

    for image_path, characters in image_groups.items():
        if len(characters) > 1:
            duplicates_found = True
            print(f"\nИзображение: {image_path}")
            print(f"Используется {len(characters)} персонажами:")
            for char in characters:
                print(f"  - ID {char['id']}: {char['name']}")

    if not duplicates_found:
        print("Дубликаты изображений не найдены.")

if __name__ == "__main__":
    find_duplicate_images()