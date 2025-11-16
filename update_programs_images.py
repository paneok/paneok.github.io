import json
import os
from pathlib import Path

# Загружаем данные программ
with open('data/programs-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Папка с изображениями
images_dir = Path('images/catalog/Программы')

# Создаем словарь для сопоставления названий
image_mapping = {
    'Топиарий.jpg': 'topiary',
    'анимационная программа.jpg': 'standard',
    'Майнкрафт.jpg': 'minecraft',
    'научное шоу.jpg': 'science-show',
    'паралон пати.jpg': 'foam-party',
    'Сахарное буритто.jpg': 'sugar-burrito',
    'Аквагрим.jpg': 'aquagrim',
    'Бьюти бар.jpg': 'beauty-bar',
    'роспись кепок.jpg': 'cap-painting',
    'неон пати.jpg': 'neon-party',
    'Овершейки.jpg': 'oversheiki',
    'Сахарная вата.jpg': 'cotton-candy',
    'теслашоу.jpg': 'tesla-show',
    'шоу мыльных пузырей.jpg': 'bubble-show',
    'челлендж пати.jpg': 'challenge-party',
    'роспись шоперов.jpg': 'shopper-painting',
    'Мороженное.jpg': 'nitrogen-icecream',
    'Фокусник.jpg': 'magician',
    'Цвтная дискотека.jpg': 'color-disco',
    'попит.jpg': 'pop-it-party',
    'Слаймы.jpg': 'slimes',
    'роспись футболок.jpg': 'tshirt-painting',
    'дискотека в серебре.jpg': 'foil-disco',
    'амонгас.jpg': 'among-us',
    'деревянные значки магнитики.jpg': 'badge-painting',
    'блоггерская вечеринка.jpg': 'blogger-party'
}

# Обновляем пути к изображениям
for program in data['programs']:
    slug = program['slug']

    # Ищем соответствующее изображение
    for img_name, img_slug in image_mapping.items():
        if img_slug == slug:
            image_path = f'images/catalog/Программы/{img_name}'
            if os.path.exists(image_path):
                program['images'] = {
                    'main': image_path,
                    'gallery': [image_path]  # Пока используем одно изображение
                }
                print(f'OK {program["name"]}: {image_path}')
            break

    # Если изображение не найдено
    if 'images' not in program or not program['images']['main']:
        program['images'] = {
            'main': 'images/placeholder.jpg',
            'gallery': []
        }
        print(f'NO {program["name"]}: no image found')

# Сохраняем обновленные данные
with open('data/programs-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('\nDone! Programs data updated!')
