#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from collections import defaultdict

def fix_duplicates():
    """Исправить дубликаты изображений, оставив только одного персонажа с фото"""

    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data['characters']

    # Группируем по image.main
    image_groups = defaultdict(list)

    for char in characters:
        main_image = char['images']['main']
        image_groups[main_image].append(char)

    updated = 0

    for image_path, chars in image_groups.items():
        if len(chars) > 1 and image_path != "images/catalog/placeholder.png":
            print(f"Дубликат: {image_path} используется {len(chars)} персонажами")
            # Оставляем первого, остальных на placeholder
            for i, char in enumerate(chars):
                if i > 0:
                    char['images']['main'] = "images/catalog/placeholder.png"
                    char['images']['gallery'] = ["images/catalog/placeholder.png"]
                    updated += 1
                    print(f"  Изменен {char['name']} id {char['id']}")

    # Сохранить
    with open('data/characters-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Обновлено {updated} персонажей!")

if __name__ == "__main__":
    fix_duplicates()