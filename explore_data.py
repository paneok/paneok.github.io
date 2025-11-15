import json
import os

# Чтение файла с данными
with open('data/characters-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

characters = data['characters']
print(f"Всего персонажей: {len(characters)}")

# Анализ существующих тэгов
all_tags = set()
for char in characters:
    if 'tags' in char and char['tags']:
        if isinstance(char['tags'], list):
            all_tags.update(char['tags'])
        elif isinstance(char['tags'], str):
            all_tags.add(char['tags'])

print(f"Существующие тэги: {sorted(all_tags)}")

# Показать несколько примеров персонажей с их тэгами
print("\nПримеры персонажей:")
for i, char in enumerate(characters[:10]):
    tags = char.get('tags', [])
    if not tags:
        tags = ['Нет тэгов']
    print(f"{i+1}. {char['name']} - Тэги: {tags}")