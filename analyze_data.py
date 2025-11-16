#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Простой скрипт для анализа структуры данных персонажей
"""

import json
import sys
from pathlib import Path

def analyze_data():
    """Анализирует структуру данных персонажей"""
    
    data_file = Path("data/characters-data.json")
    
    if not data_file.exists():
        print(f"Ошибка: Файл {data_file} не найден!")
        return
    
    try:
        print("Попытка чтения файла...")
        
        # Пробуем разные кодировки
        encodings = ['utf-8', 'utf-8-sig', 'cp1251', 'latin1']
        
        for encoding in encodings:
            try:
                print(f"Пробуем кодировку: {encoding}")
                with open(data_file, 'r', encoding=encoding) as f:
                    content = f.read()
                
                print(f"Размер файла: {len(content)} символов")
                print("Первые 200 символов:")
                print(repr(content[:200]))
                
                # Пробуем парсить JSON
                data = json.loads(content)
                print(f"✅ Успешно загружено с кодировкой {encoding}")
                print(f"Тип данных: {type(data)}")
                
                if isinstance(data, dict):
                    print(f"Ключи словаря: {list(data.keys())}")
                    if len(data) > 0:
                        first_key = list(data.keys())[0]
                        print(f"Первый ключ: {first_key}")
                        print(f"Значение первого ключа: {type(data[first_key])}, размер: {len(data[first_key]) if hasattr(data[first_key], '__len__') else 'неизвестно'}")
                        if len(data[first_key]) > 0:
                            print(f"Первый элемент: {data[first_key][0] if isinstance(data[first_key], list) else list(data[first_key].items())[0] if isinstance(data[first_key], dict) else data[first_key]}")
                
                elif isinstance(data, list):
                    print(f"Список содержит {len(data)} элементов")
                    if len(data) > 0:
                        print(f"Первый элемент: {data[0]}")
                        if isinstance(data[0], dict):
                            print(f"Ключи первого элемента: {list(data[0].keys())}")
                
                break  # Если успешно, выходим из цикла
                
            except Exception as e:
                print(f"Ошибка с кодировкой {encoding}: {e}")
                continue
        else:
            print("Не удалось прочитать файл ни с одной из кодировок")
            
    except Exception as e:
        print(f"Общая ошибка: {e}")

if __name__ == "__main__":
    analyze_data()