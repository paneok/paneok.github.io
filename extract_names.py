#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json

def extract_names():
    """Извлечь все названия персонажей из JSON файла"""
    with open('data/characters-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data['characters']
    names = []

    for char in characters:
        names.append(char['name'])

    print("=== СПИСОК ПЕРСОНАЖЕЙ В JSON ===")
    for i, name in enumerate(names, 1):
        print(f"{i}. {name}")

    print(f"\nВсего персонажей: {len(names)}")

    return names

if __name__ == "__main__":
    extract_names()