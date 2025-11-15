#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from pathlib import Path

def fix_image_paths():
    """Исправить пути изображений в characters-data.json на актуальные"""

    # Загружаем данные
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data['characters']
    catalog_path = Path("images/catalog")

    # Словарь соответствий для Нового года персонажей
    new_year_mappings = {
        "Скоморох 1": "images/catalog/Девочка.JPG",  # Используем существующее
        "Скоморох 2": "images/catalog/Девочка.JPG",
        "Скоморох 3": "images/catalog/Девочка.JPG",
        "Скоморох 4": "images/catalog/Девочка.JPG",
        "Скоморох 5": "images/catalog/Девочка.JPG",
        "Санта": "images/catalog/Новый год/Санта и Эльфы.png",
        "Эльф девочка вип": "images/catalog/Новый год/Дополнительные герои/Эльф ж вип.png",
        "Эльф мальчик вип": "images/catalog/Новый год/Дополнительные герои/Эльф ж вип.png",
        "Зайка белый": "images/catalog/Новый год/Дополнительные герои/Заяц белый.png",
        "Зайка серый": "images/catalog/Новый год/Дополнительные герои/Заяц серый.png",
        "Девочка новогодняя кукла": "images/catalog/Новый год/Девочка.JPG",
        "Ростовая кукла Мишка Тедди": "images/catalog/Новый год/Ростовая кукла.JPG",
        "Ростовая кукла Олаф": "images/catalog/Новый год/Ростовая кукла.JPG",
        "Ростовая кукла Сердце": "images/catalog/Новый год/Ростовая кукла.JPG",
        "Фъерк облачко": "images/catalog/Новый год/Дополнительные герои/Лошадка.png",  # Примерно
        "Май литтл пони Искорка": "images/catalog/Новый год/Дополнительные герои/Май литтл пони Пинки Пай.png",
        "Май литтл пони Пинки Пай": "images/catalog/Новый год/Дополнительные герои/Май литтл пони Пинки Пай.png",
        "Май литтл пони Радуга Дэш": "images/catalog/Новый год/Дополнительные герои/Май литтл пони Пинки Пай.png",
        "Мимимишки Тучка": "images/catalog/Новый год/Дополнительные герои/Тучка Мимимишки.png",  # Если есть
    }

    fixed_count = 0

    for char in characters:
        name = char['name']
        main_image = char['images']['main']

        # Проверяем, существует ли main изображение
        if not os.path.exists(main_image):
            print(f"Изображение не найдено: {main_image} для {name}")

            # Ищем альтернативу
            new_path = None

            # Сначала проверяем маппинг для Нового года
            if name in new_year_mappings:
                new_path = new_year_mappings[name]
                if os.path.exists(new_path):
                    print(f"  Заменяем на: {new_path}")
                else:
                    print(f"  Альтернатива не существует: {new_path}")

            # Если не нашли в маппинге, ищем в gallery
            if not new_path and char['images']['gallery']:
                for img in char['images']['gallery']:
                    if os.path.exists(img):
                        new_path = img
                        print(f"  Используем из gallery: {new_path}")
                        break

            # Если все еще не нашли, ищем похожее изображение
            if not new_path:
                # Ищем файлы с похожим именем
                search_name = name.lower().replace(" ", "").replace("ведущая", "").replace("ведущий", "")
                for file_path in catalog_path.rglob("*"):
                    if file_path.is_file():
                        file_name = file_path.name.lower().replace(" ", "").replace(".png", "").replace(".jpg", "")
                        if search_name in file_name or file_name in search_name:
                            new_path = f"images/catalog/{file_path.relative_to(catalog_path)}"
                            print(f"  Найдено похожее: {new_path}")
                            break

            # Если ничего не нашли, используем первое существующее из gallery или общее
            if not new_path:
                # Ищем любое существующее изображение
                for file_path in catalog_path.rglob("*.png"):
                    if file_path.is_file():
                        new_path = f"images/catalog/{file_path.relative_to(catalog_path)}"
                        print(f"  Используем первое доступное: {new_path}")
                        break

            if new_path:
                char['images']['main'] = new_path
                # Обновляем gallery, если нужно
                if new_path not in char['images']['gallery']:
                    char['images']['gallery'].insert(0, new_path)
                fixed_count += 1
            else:
                print(f"  Не удалось найти замену для {name}")

    # Сохраняем обновленный JSON
    with open('data/characters-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nИсправлено {fixed_count} путей изображений!")
    print("JSON файл обновлен!")

if __name__ == "__main__":
    fix_image_paths()