#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from pathlib import Path

def check_missing_images():
    """Проверить, какие изображения все еще отсутствуют"""

    # Загружаем данные
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data['characters']
    missing_images = []

    print("=== ПРОВЕРКА ОТСУТСТВУЮЩИХ ИЗОБРАЖЕНИЙ ===")

    for char in characters:
        name = char['name']
        main_image = char['images']['main']

        if not Path(main_image).exists():
            print(f"Отсутствует: {main_image} для {name}")
            missing_images.append((name, main_image))

        # Также проверить gallery
        for img in char['images']['gallery']:
            if not Path(img).exists():
                print(f"Отсутствует в галерее: {img} для {name}")

    print(f"\nВсего отсутствующих main изображений: {len(missing_images)}")

    # Предложить замены для Нового года персонажей
    new_year_fallbacks = {
        "Скоморох 1": "images/catalog/Новый год/Девочка.JPG",
        "Скоморох 2": "images/catalog/Новый год/Девочка.JPG",
        "Скоморох 3": "images/catalog/Новый год/Девочка.JPG",
        "Скоморох 4": "images/catalog/Новый год/Девочка.JPG",
        "Скоморох 5": "images/catalog/Новый год/Девочка.JPG",
        "Снежная королева": "images/catalog/Новый год/Снежинка.png",
        "Май литтл пони Искорка": "images/catalog/Новый год/Дополнительные герои/Май литтл пони Пинки Пай.png",
        "Тучка Мимимишки": "images/catalog/Тучка Мимимишки.png",  # Если есть
        "Фъерк облачко 1": "images/catalog/Фъерк облачко 1.png",  # Если есть
        "Эльф м вип": "images/catalog/Новый год/Дополнительные герои/Эльф ж вип.png",
    }

    # Обновить отсутствующие
    updated_count = 0
    for name, old_path in missing_images:
        new_path = None

        if name in new_year_fallbacks:
            new_path = new_year_fallbacks[name]
            if os.path.exists(new_path):
                print(f"Заменяем {name}: {old_path} -> {new_path}")
            else:
                print(f"Запасной путь не существует: {new_path}")

        if new_path:
            # Найти персонажа и обновить
            for char in characters:
                if char['name'] == name:
                    char['images']['main'] = new_path
                    if new_path not in char['images']['gallery']:
                        char['images']['gallery'].insert(0, new_path)
                    updated_count += 1
                    break

    # Сохранить, если были обновления
    if updated_count > 0:
        with open('data/characters-data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\nОбновлено {updated_count} изображений!")

    return missing_images

if __name__ == "__main__":
    check_missing_images()