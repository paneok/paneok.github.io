#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from pathlib import Path

def final_image_fix():
    """Финальное исправление всех отсутствующих изображений"""

    # Загружаем данные
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data['characters']
    catalog_path = Path("images/catalog")

    # Создаем словарь всех доступных изображений
    available_images = {}
    for file_path in catalog_path.rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() in ['.png', '.jpg', '.jpeg']:
            # Получаем базовое имя без расширения
            base_name = file_path.stem.lower().replace(" ", "").replace("-", "")
            available_images[base_name] = f"images/catalog/{file_path.relative_to(catalog_path)}"

    print(f"Найдено {len(available_images)} изображений в каталоге")

    fixed_count = 0

    for char in characters:
        name = char['name']
        main_image = char['images']['main']

        if not os.path.exists(main_image) or 'placeholder' in main_image:
            print(f"Исправляем: {name} - {main_image}")

            # Ищем подходящее изображение
            found_image = None

            # Прямое совпадение по имени
            search_names = [
                name.lower().replace(" ", "").replace("-", ""),
                name.lower().replace("ведущая", "").replace("ведущий", "").strip(),
                name.lower().replace(" ", "-"),
                name.lower().split()[0] if " " in name.lower() else name.lower()
            ]

            for search_name in search_names:
                if search_name in available_images:
                    found_image = available_images[search_name]
                    print(f"  Найдено прямое совпадение: {found_image}")
                    break

            # Если не найдено, ищем частичное совпадение
            if not found_image:
                name_parts = name.lower().replace(" ", "").split()
                for part in name_parts:
                    if len(part) > 3:  # Игнорируем короткие слова
                        for img_name, img_path in available_images.items():
                            if part in img_name or img_name in part:
                                found_image = img_path
                                print(f"  Найдено частичное совпадение: {found_image}")
                                break
                        if found_image:
                            break

            # Если все еще не найдено, используем первое доступное изображение подходящей категории
            if not found_image:
                # Для ведущих - ищем ведущих
                if "ведущ" in name.lower():
                    for img_name, img_path in available_images.items():
                        if "ведущ" in img_name:
                            found_image = img_path
                            print(f"  Найдено по категории ведущих: {found_image}")
                            break

                # Для Нового года - ищем новогодние
                elif any(word in name.lower() for word in ["новогодн", "сант", "эльф", "зай", "скоморох", "снежн"]):
                    for img_name, img_path in available_images.items():
                        if any(word in img_name for word in ["новый", "сант", "эльф", "заяц", "скоморох", "снеж"]):
                            found_image = img_path
                            print(f"  Найдено по категории Новый год: {found_image}")
                            break

            # Если ничего не найдено, используем любое изображение
            if not found_image and available_images:
                found_image = list(available_images.values())[0]
                print(f"  Используем первое доступное: {found_image}")

            if found_image:
                char['images']['main'] = found_image
                if found_image not in char['images']['gallery']:
                    char['images']['gallery'].insert(0, found_image)
                fixed_count += 1
            else:
                print(f"  Не удалось найти замену для {name}")

    # Сохраняем обновленный JSON
    with open('data/characters-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nИсправлено {fixed_count} изображений!")

if __name__ == "__main__":
    final_image_fix()