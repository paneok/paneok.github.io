import json
import re

# Категории для персонажей
CATEGORIES = {
    'мультики': [
        # Мультфильмы и аниме
        'Лунтик', 'Мальвина', 'Буратино', 'Колдунья', 'Дракончик', 'Как приручить дракона',
        'Бравл Старс', 'Майнкрафт', 'Энгри бердс', 'Ллойд ниндзяго', 'Щенячий патруль',
        'Май литтл пони', 'Гравити Фолз', 'Мелоди', 'Лабубу', 'Куроми',
        'Доктор Плюшева', 'Буба', 'Лол Единорожка', 'Леди Баг', 'Семейка Аддамс',
        'Аврора', 'Алиса', 'Машенька'
    ],
    'фильмы': [
        # Фильмы
        'Барби', 'Круэлла', 'Малефисента', 'Вампир Дракула', 'Дракулаура',
        'Игра в кальмара', 'Дарт Вейдер', 'Гринч', 'Бэтмен', 'Санта'
    ],
    'праздничные': [
        # Новый год, праздники
        'Санта', 'Эльф', 'Гринч', 'Девочка новогодняя', 'Эльфы',
        'Баба Яга', 'Скоморох', 'Гусь обнимусь', 'Заяц'
    ],
    'сказки': [
        # Сказочные персонажи
        'Буратино', 'Мальвина', 'Баба Яга', 'Шапокляк', 'Шляпник',
        'Колдунья', 'Дракончик', 'Ведьма', 'Единорожка'
    ],
    'фантастика': [
        # Фантастические персонажи
        'Дарт Вейдер', 'Космонавт', 'Бэтмен', 'Малефисента', 'Вампир Дракула',
        'Дракулаура', 'Круэлла', 'Кукла Аннабель', 'Кукла Чаки'
    ],
    'ростовые куклы': [
        # Ростовые куклы (как правило с "вип", "беж", "розовый" и т.д.)
        'вип', 'лабубу', 'куроми', 'единорожка'
    ],
    'супер-герои': [
        # Супер-герои
        'Бэтмен', 'Леди Баг', 'Дарт Вейдер', 'Супер'
    ],
    'нейтральные': [
        # Нейтральные персонажи (ведущие, клоуны, военные и т.д.)
        'Ведущая', 'Ведущий', 'Клоун', 'Военный', 'Гавайи', 'Школьница',
        'Космонавт', 'Гвен Стейси', 'Белка Лиса'
    ],
    'животные': [
        # Животные
        'Белка', 'Лиса', 'Заяц', 'Дракон', 'Гусь', 'Единорожка',
        'Куроми', 'Лабубу'
    ]
}

def categorize_character(name):
    """Определяет категории для персонажа по его названию"""
    categories = []
    name_lower = name.lower()
    
    # Проверяем каждую категорию
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            if keyword.lower() in name_lower:
                if category not in categories:
                    categories.append(category)
                break
    
    # Если не нашли ни одной категории, добавляем нейтральную
    if not categories:
        categories.append('нейтральные')
    
    return categories

# Загрузка данных
with open('data/characters-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

characters = data['characters']
print(f"Обрабатываю {len(characters)} персонажей...")

# Категоризация персонажей
updated_count = 0
for i, character in enumerate(characters):
    old_tags = character.get('tags', [])
    new_categories = categorize_character(character['name'])
    
    # Обновляем тэги
    character['tags'] = new_categories
    
    if old_tags != new_categories:
        updated_count += 1
        print(f"Обновлен: {character['name']} - {new_categories}")

print(f"\nВсего обновлено персонажей: {updated_count}")

# Сохранение обновленных данных
with open('data/characters-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Данные сохранены в data/characters-data.json")

# Статистика по категориям
category_stats = {}
for character in characters:
    for tag in character['tags']:
        category_stats[tag] = category_stats.get(tag, 0) + 1

print("\nСтатистика по категориям:")
for category, count in sorted(category_stats.items()):
    print(f"{category}: {count} персонажей")