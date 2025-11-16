// Скрипт для анализа структуры данных персонажей
const fs = require('fs');

console.log('Анализ файла characters-data.json...');

try {
    // Читаем файл как строку
    const content = fs.readFileSync('data/characters-data.json', 'utf8');
    console.log(`Размер файла: ${content.length} символов`);
    
    // Парсим JSON
    const data = JSON.parse(content);
    console.log(`Тип данных: ${typeof data}`);
    
    if (Array.isArray(data)) {
        console.log(`Список содержит ${data.length} элементов`);
        
        if (data.length > 0) {
            const firstItem = data[0];
            console.log('Первый элемент:');
            console.log(JSON.stringify(firstItem, null, 2).substring(0, 500));
            
            // Ищем поля с ценами
            const priceFields = [];
            for (const [key, value] of Object.entries(firstItem)) {
                if (typeof value === 'number' && value > 0) {
                    priceFields.push(key);
                }
                if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('цен')) {
                    priceFields.push(key);
                }
            }
            
            console.log(`Найденные поля с ценами: ${priceFields.join(', ')}`);
            
            // Обновляем цены на 5000
            let updatedCount = 0;
            for (const character of data) {
                for (const field of priceFields) {
                    if (character.hasOwnProperty(field)) {
                        const oldPrice = character[field];
                        character[field] = 5000;
                        updatedCount++;
                        console.log(`Обновлена цена у персонажа '${character.name || character.title || 'Unknown'}': ${oldPrice} -> 5000`);
                    }
                }
            }
            
            // Сохраняем обновленные данные
            fs.writeFileSync('data/characters-data.json', JSON.stringify(data, null, 2), 'utf8');
            console.log(`✅ Успешно обновлено ${updatedCount} цен на 5000`);
        }
    } else if (typeof data === 'object') {
        console.log('Структура данных - объект');
        console.log('Ключи:', Object.keys(data));
        
        // Если это объект с массивом персонажей
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value) && value.length > 0) {
                console.log(`Найден массив в поле '${key}' с ${value.length} элементами`);
                const firstItem = value[0];
                console.log('Первый элемент:');
                console.log(JSON.stringify(firstItem, null, 2).substring(0, 500));
                break;
            }
        }
    }
    
} catch (error) {
    console.error('Ошибка:', error.message);
}