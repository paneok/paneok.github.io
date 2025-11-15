#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import hashlib
from pathlib import Path
from collections import defaultdict

def get_file_hash(filepath):
    """Получить хэш файла для сравнения содержимого"""
    hash_md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def find_name_duplicates():
    """Найти файлы с одинаковыми названиями (игнорируя расширение)"""
    images_path = Path("images")

    if not images_path.exists():
        print("Каталог images не найден")
        return

    # Группируем файлы по базовому имени (без расширения, в нижнем регистре)
    name_groups = defaultdict(list)

    # Рекурсивно ищем все файлы в images/
    for file_path in images_path.rglob("*"):
        if file_path.is_file():
            filename = file_path.name
            # Получаем имя без расширения
            name_without_ext = Path(filename).stem.lower()
            name_groups[name_without_ext].append({
                'full_path': file_path,
                'filename': filename,
                'size': file_path.stat().st_size
            })

    print("=== ПОИСК ДУБЛИКАТОВ ПО НАЗВАНИЯМ В images/ ===")

    duplicates_found = []

    for base_name, files in name_groups.items():
        if len(files) > 1:
            print(f"\nГруппа: {base_name}")
            print(f"Найдено {len(files)} файлов:")

            # Проверяем, являются ли они дубликатами по содержимому
            hash_groups = defaultdict(list)
            for file_info in files:
                try:
                    file_hash = get_file_hash(file_info['full_path'])
                    hash_groups[file_hash].append(file_info)
                except Exception as e:
                    print(f"  Ошибка чтения {file_info['filename']}: {e}")

            # Если есть группы с одинаковым хэшем, это дубликаты
            for file_hash, dup_files in hash_groups.items():
                if len(dup_files) > 1:
                    print(f"  Дубликаты (хэш: {file_hash[:8]}...):")
                    for i, file_info in enumerate(dup_files):
                        print(f"    {i+1}. {file_info['filename']} ({file_info['size']} байт)")

                    # Оставляем первый файл, остальные помечаем для удаления
                    duplicates_found.extend(dup_files[1:])

    if not duplicates_found:
        print("\nДубликаты не найдены.")
    else:
        print(f"\nНайдено {len(duplicates_found)} файлов для удаления.")

    return duplicates_found

def remove_duplicates(duplicates):
    """Удалить дубликаты"""
    if not duplicates:
        print("Нет файлов для удаления.")
        return

    print("\n=== УДАЛЕНИЕ ДУБЛИКАТОВ ===")

    for file_info in duplicates:
        try:
            os.remove(file_info['full_path'])
            print(f"Удален: {file_info['filename']}")
        except Exception as e:
            print(f"Ошибка удаления {file_info['filename']}: {e}")

    print(f"\nУдалено {len(duplicates)} файлов.")

if __name__ == "__main__":
    duplicates = find_name_duplicates()

    if duplicates:
        # Автоматически удаляем дубликаты
        remove_duplicates(duplicates)
    else:
        print("Дубликаты не найдены, ничего удалять не нужно.")