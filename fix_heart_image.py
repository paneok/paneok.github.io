#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json

def fix_heart_image():
    """Исправить изображение для Ростовой куклы Сердце"""

    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data['characters']

    for char in characters:
        if char['name'] == "Ростовая кукла Сердце":
            print(f"Найден персонаж: {char['name']} id {char['id']}")
            print(f"Текущее изображение: {char['images']['main']}")
            # Изменить на placeholder, поскольку фото сердца нет
            char['images']['main'] = "images/catalog/placeholder.png"
            char['images']['gallery'] = ["images/catalog/placeholder.png"]
            print("Изменено на placeholder.png")

    # Сохранить
    with open('data/characters-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Исправлено!")

if __name__ == "__main__":
    fix_heart_image()