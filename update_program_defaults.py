import json

# Загружаем данные программ
with open('data/programs-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Маппинг ID программ на персонажей по умолчанию и цены
# Формат: program_id: (character_id or None, price_data)
program_updates = {
    1: (None, {"amount": 6000, "unit": "₽/час", "isCharacterPrice": True, "requiresCharacter": True}),  # Анимационная программа СТАНДАРТ - требует выбор персонажа
    2: (121, {"amount": 7000, "unit": "₽/час", "isCharacterPrice": False}),  # Блоггерская вечеринка - Ведущий черный ж (ID: 121)
    4: (120, {"amount": 8500, "unit": "₽/час", "isCharacterPrice": False}),  # Челлендж party - Ведущий неон (ID: 120)
    5: (117, {"amount": 10000, "unit": "₽/час", "isCharacterPrice": False}),  # Шоу мыльных пузырей - Ведущий ж диско (ID: 117)
    8: (18, {"amount": 10000, "unit": "₽/час", "isCharacterPrice": False}),  # Бьюти-бар - Барби (ID: 18)
    11: (None, {"amount": 7000, "unit": "₽", "pricePerPerson": 500}),  # Роспись значков - не требует персонажа
    12: (None, {"amount": 7000, "unit": "₽", "pricePerPerson": 500}),  # Слаймы - не требует персонажа
    13: (None, {"amount": 7000, "unit": "₽", "pricePerPerson": 1000}),  # Роспись футболок - не требует персонажа
    14: (None, {"amount": 7000, "unit": "₽", "pricePerPerson": 500}),  # Овершейки - не требует персонажа
    15: (None, {"amount": 7000, "unit": "₽", "pricePerPerson": 500}),  # Роспись шопперов - не требует персонажа
    16: (None, {"amount": 7000, "unit": "₽", "pricePerPerson": 1000}),  # Роспись кепок - не требует персонажа
    17: (105, {"amount": 15000, "unit": "₽/час", "isCharacterPrice": False}),  # Дискотека в серебре - Ведущая К-поп (ID: 105)
    18: (105, {"amount": 18000, "unit": "₽/час", "isCharacterPrice": False}),  # Цветная дискотека - Ведущая К-поп (ID: 105)
    19: (120, {"amount": 18000, "unit": "₽/час", "isCharacterPrice": False}),  # Neon Party - Ведущий неон (ID: 120)
    20: (120, {"amount": 13000, "unit": "₽/час", "isCharacterPrice": False}),  # Поролон Party - Ведущий неон (ID: 120)
    21: (203, {"amount": 7500, "unit": "₽/час", "isCharacterPrice": False}),  # Майнкрафт - Майнкрафт персонаж (ID: 203)
    22: (81, {"amount": 7500, "unit": "₽/час", "isCharacterPrice": False}),  # Among Us - Амонг зеленый (ID: 81)
    23: (106, {"amount": 7500, "unit": "₽/час", "isCharacterPrice": False}),  # Pop It party - Ведущая Поп ит (ID: 106)
    24: (None, {"amount": 18000, "unit": "₽", "pricePerPerson": 1500}),  # Топиарий - не требует персонажа
    25: (None, {"amount": 13000, "unit": "₽", "pricePerPerson": 500}),  # Сахарное бурито - не требует персонажа
    26: (None, {"amount": 15000, "unit": "₽"}),  # Сахарная вата - не требует персонажа
    3: (None, {"amount": 6000, "unit": "₽"}),  # Аквагрим - не требует персонажа
}

# Обновляем программы
updated_count = 0
for program in data['programs']:
    program_id = program['id']
    if program_id in program_updates:
        char_id, pricing = program_updates[program_id]

        # Обновляем персонажа по умолчанию
        if char_id is None:
            program['defaultCharacterId'] = None
        else:
            program['defaultCharacterId'] = char_id

        # Обновляем цены
        program['pricing'] = pricing
        
        # Добавляем флаг требует ли программа выбора персонажа
        if 'requiresCharacter' in pricing:
            program['requiresCharacter'] = pricing['requiresCharacter']
            del pricing['requiresCharacter']  # Удаляем из pricing для чистоты
        
        updated_count += 1
        print(f"Обновлена программа {program_id}: {program['name']}")

# Сохраняем обновленные данные
with open('data/programs-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nГотово! Обновлено {updated_count} программ.')
print('Данные программ обновлены с новыми ценами и персонажами по умолчанию!')
