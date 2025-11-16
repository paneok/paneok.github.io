#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для изменения цен всех персонажей на 5000
"""

import json
import sys
from pathlib import Path

def update_character_prices():
    """Обновляет цены всех персонажей на 5000"""
    
    # Путь к файлу с данными персонажей
    data_file = Path("data/characters-data.json")
    
    if not data_file.exists():
        print(f"Ошибка: Файл {data_file} не найден!")
        return False
    
    try:
        # Читаем данные с правильной кодировкой
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"Загружено {len(data)} персонажей")
        
        # Проверяем структуру данных
        if data and isinstance(data[0], dict):
            print("Пример структуры первого персонажа:")
            print(json.dumps(data[0], ensure_ascii=False, indent=2)[:300])
            
            # Ищем поля с ценами
            price_fields = []
            for key in data[0].keys():
                if 'price' in key.lower() or 'стоимость' in key.lower() or 'цен' in key.lower():
                    price_fields.append(key)
            
            if not price_fields:
                # Если не нашли явные поля цен, проверим все числовые поля
                for key, value in data[0].items():
                    if isinstance(value, (int, float)) and value > 0:
                        price_fields.append(key)
            
            print(f"Найдены возможные поля цен: {price_fields}")
            
            # Обновляем цены
            updated_count = 0
            for character in data:
                for field in price_fields:
                    if field in character:
                        old_price = character[field]
                        character[field] = 5000
                        updated_count += 1
                        print(f"Обновлена цена у персонажа '{character.get('name', character.get('title', 'Unknown'))}': {old_price} -> 5000")
            
            # Сохраняем обновленные данные
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Успешно обновлено {updated_count} цен на 5000")
            return True
            
    except Exception as e:
        print(f"Ошибка при обработке файла: {e}")
        return False

if __name__ == "__main__":
    success = update_character_prices()
    sys.exit(0 if success else 1)