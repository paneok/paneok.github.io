#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from pathlib import Path

# Список недостающих персонажей (из compare_characters.py)
missing_characters = [
    "Аврора Спящая красавица",
    "Амонг ас зеленый",
    "Амонг ас красный",
    "Амонг ас розовый",
    "Белочка",
    "Бравл Старс Леон",
    "Бравл Старс Шелли",
    "Буба домовой",
    "Ведущая K-pop",
    "Ведущая Лабубу",
    "Ведущая Майнкрафт",
    "Ведущий Майнкрафт",
    "Ведущая Мафия",
    "Ведущий Мультфильмы",
    "Ведущая неоновый зеленый",
    "Ведущая оранжевая с пиджаком",
    "Ведущая Поп ит",
    "Ведущая Стиляга",
    "Ведущая Таба лапка",
    "Ведущая Тачки",
    "Ведущая Тик-ток",
    "Ведущая Хаги Ваги",
    "Ведущая девочка черная пайетка",
    "Ведущий мальчик черная пайетка",
    "Ведьмочка",
    "Военный костюм женский",
    "Военный костюм мужской",
    "Гавайи",
    "Герои в масках Аллет",
    "Девочка новогодняя кукла",
    "Дракончик",
    "Зайка белый",
    "Зайка серый",
    "Игра в кальмара",
    "Клоун 2 комбинезон",
    "Колдунья",
    "Кукла Аннабель",
    "Кукла Чаки",
    "Куроми",
    "Лабубу",
    "Лисичка",
    "Ллойд ниндзяго",
    "Лол Единорожка",
    "Луиза Мадригаль",
    "Майнкрафт Криппер",
    "Майнкрафт Стив",
    "Малефисента",
    "Мальвина",
    "Машенька",
    "Мейвис Монстры на каникулах",
    "Мелоди",
    "Микки Маус",
    "Мимимишки Тучка",
    "Миньон",
    "Мумия",
    "Пеппи длинный чулок",
    "Пижамная вечеринка",
    "Пиратка 2",
    "Принцесса золотая",
    "Принцесса Бэль",
    "Принцесса Жасмин",
    "Принцесса Золушка",
    "Принцесса Рапунцель",
    "Радужный друг Блу",
    "Роза Барбоскина",
    "Семейка Аддамс Венсдей",
    "Семейка Венсдей Мартиша",
    "Семейка Аддамс Паксли",
    "Скоморохи (7 шт)",
    "Сладкоежка девочка",
    "Снежная королева",
    "Супергерл",
    "Супермен",
    "Суперкот",
    "Тигруля",
    "Ферма (2 ведущих)",
    "Фея Винкс Блум",
    "Форт Боярд (2 ведущих)",
    "Футбол",
    "Фъерк облачко",
    "Харли Квинн",
    "Хогвардс Джинни Уизли",
    "Хогвардс Палумна Лавгут",
    "Цифровой цирк Помни",
    "Черепашка ниндзя",
    "Шапокляк",
    "Школьница",
    "Щенячий патруль Гонщик",
    "Щенячий патруль Маршал",
    "Щенячий патруль Скай",
    "Энгри Бердс красный",
    "Эльф девочка",
    "Эльф мальчик",
    "Эльф девочка вип",
    "Эльф мальчик вип",
    "Санта",
    "Ростовая кукла Мишка Тедди",
    "Ростовая кукла Олаф",
    "Ростовая кукла Сердце"
]

def find_image_path(name):
    """Найти путь к изображению для персонажа"""
    catalog_path = Path("images/catalog")

    # Попробовать точное совпадение
    exact_match = catalog_path / f"{name}.png"
    if exact_match.exists():
        return f"images/catalog/{name}.png"

    # Попробовать с .jpg
    exact_match_jpg = catalog_path / f"{name}.jpg"
    if exact_match_jpg.exists():
        return f"images/catalog/{name}.jpg"

    # Попробовать вариации
    variations = [
        name.replace(" ", " ").lower(),
        name.replace(" ", "-").lower(),
        name.replace(" ", "").lower(),
    ]

    for var in variations:
        for ext in ['.png', '.jpg']:
            path = catalog_path / f"{var}{ext}"
            if path.exists():
                return f"images/catalog/{var}{ext}"

    # Если не найдено, вернуть placeholder
    return "images/catalog/placeholder.png"

def create_character_record(name, next_id):
    """Создать запись персонажа"""

    # Определить категорию
    if "Ведущая" in name or "Ведущий" in name:
        category = "entertainment"
        emoji = "🎤"
    elif "Принцесса" in name or "Фея" in name or "Единорожка" in name:
        category = "fairy-tale"
        emoji = "👸"
    elif "Супер" in name or "Бэтмен" in name or "Человек паук" in name:
        category = "superheroes"
        emoji = "🦸"
    elif "Динозавр" in name or "Дракон" in name:
        category = "animals"
        emoji = "🦖"
    else:
        category = "cartoon"
        emoji = "🎭"

    # Slug
    slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("ё", "e")

    # Найти изображение
    main_image = find_image_path(name)
    gallery = [main_image]

    # Определить пол и возраст
    if "девочка" in name.lower() or "женский" in name.lower() or "ведущая" in name.lower():
        gender = "girls"
        age = "3-8"
    elif "мальчик" in name.lower() or "мужской" in name.lower() or "ведущий" in name.lower():
        gender = "boys"
        age = "5-10"
    else:
        gender = "unisex"
        age = "3-12"

    # Создать запись
    character = {
        "id": next_id,
        "name": name,
        "slug": slug,
        "category": category,
        "emoji": emoji,
        "images": {
            "main": main_image,
            "gallery": gallery
        },
        "description": {
            "short": f"{name} - веселый персонаж для праздника!",
            "full": f"{name} подарит незабываемые эмоции и веселье на вашем празднике!"
        },
        "features": {
            "age": age,
            "gender": gender,
            "activities": ["dance", "active", "creative"],
            "duration": [1, 2]
        },
        "pricing": {
            "hourly": 3500,
            "packages": [
                {
                    "duration": 2,
                    "price": 6500
                }
            ]
        },
        "tags": [name.lower()],
        "isPopular": False,
        "isNew": True
    }

    return character

def add_missing_characters():
    """Добавить недостающих персонажей в JSON"""

    # Загружаем данные
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data['characters']

    # Найти следующий ID
    max_id = max(char['id'] for char in characters)
    next_id = max_id + 1

    print("=== ДОБАВЛЕНИЕ НЕДОСТАЮЩИХ ПЕРСОНАЖЕЙ ===")
    print(f"Начинаем с ID: {next_id}")

    added_count = 0
    for name in missing_characters:
        char_record = create_character_record(name, next_id)
        characters.append(char_record)
        print(f"Добавлен: ID {next_id} - {name}")
        next_id += 1
        added_count += 1

    # Сохраняем обновленный JSON
    with open('data/characters-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nДобавлено {added_count} персонажей!")
    print("JSON файл обновлен!")

if __name__ == "__main__":
    add_missing_characters()