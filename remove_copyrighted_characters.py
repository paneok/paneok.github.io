#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re

def remove_copyrighted_characters():
    """
    Удаляет персонажей из каталога, которые активно судятся в России
    """
    
    # Читаем исходный файл
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Исходное количество персонажей: {len(data['characters'])}")
    
    # Список персонажей для удаления (активно судятся в России)
    characters_to_remove = {
        'Фиксик Симка',
        'Фиксики Шпуля', 
        'Фиксики',
        'Чебурашка',
        'Шапокляк',
        'Три кота',
        'Роза Барбоскина',
        'Тучка Мимимишки',
        'Мимимишки Тучка',
        'Лабубу',
        'Лабубу ведущая',
        'Ведущая Лабубу',
        'Лол Единорожка',
        'Лол Единорожка',
        'Щенячий патруль',
        'Щенячий патруль Скай',
        'Щенячий патруль Маршал',
        'Щенячий патруль Гонщик'
    }
    
    # Список устаревших ID для удаления (дубликаты, ведущие и т.д.)
    deprecated_ids = [
        135,  # Лабубу ведущая
        170,  # Тучка Мимимишки
        213,  # Три кота
        215,  # Фиксики
        220,  # Щенячий патруль
        235,  # Роза Барбоскина
        262,  # Щенячий патруль Гонщик
        272,  # Ведущая Лабубу
        302,  # Лабубу
        305,  # Лол Единорожка
        315,  # Мимимишки Тучка
        327,  # Роза Барбоскина
        348,  # Шапокляк
        350,  # Щенячий патруль Гонщик
        351,  # Щенячий патруль Маршал
        352   # Щенячий патруль Скай
    ]
    
    # Фильтруем персонажей
    filtered_characters = []
    removed_count = 0
    
    for character in data['characters']:
        should_remove = False
        
        # Удаляем по названию
        if character['name'] in characters_to_remove:
            should_remove = True
            
        # Удаляем по ID
        elif character['id'] in deprecated_ids:
            should_remove = True
            
        # Дополнительные проверки для поиска дубликатов
        elif any(name in character['name'] for name in [
            'Фиксик', 'Чебурашка', 'Шапокляк', 'Три кота', 
            'Барбоскина', 'Мимимишки', 'Лабубу', 'Лол',
            'Щенячий патруль'
        ]):
            should_remove = True
        
        if should_remove:
            print(f"УДАЛЕН: {character['name']} (ID: {character['id']})")
            removed_count += 1
        else:
            filtered_characters.append(character)
    
    # Обновляем данные
    data['characters'] = filtered_characters
    
    print(f"Удалено персонажей: {removed_count}")
    print(f"Осталось персонажей: {len(data['characters'])}")
    
    # Сохраняем обновленный файл
    with open('data/characters-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("Файл обновлен: data/characters-data.json")
    
    return removed_count, len(data['characters'])

if __name__ == "__main__":
    removed, remaining = remove_copyrighted_characters()
    print(f"\nРезультат:")
    print(f"- Удалено: {removed} персонажей")
    print(f"- Осталось: {remaining} персонажей")