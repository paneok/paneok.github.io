# 🚀 Инструкция по запуску бэкенда

## Что уже сделано

✅ Создана структура проекта
✅ Настроен Express сервер
✅ Спроектирована схема БД в Prisma
✅ Реализованы все API endpoints
✅ Создан скрипт миграции данных из JSON
✅ Реализована логика калькулятора с конфликтами

## Шаги для запуска на локальной машине

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Создание базы данных

```bash
# Создать БД и таблицы
npm run db:push

# Сгенерировать Prisma Client
npm run db:generate
```

### 3. Миграция данных из JSON

```bash
# Импортировать персонажей и программы из JSON файлов
npm run seed
```

Вы увидите:
```
🌱 Starting database seed...
📖 Loading characters from JSON...
📥 Importing 120+ characters...
✅ Imported 120 characters
📖 Loading programs from JSON...
📥 Importing 26 programs...
✅ Imported 26 programs
✨ Database seed completed successfully!
```

### 4. Запуск сервера

```bash
# Development режим (с автоперезагрузкой при изменениях)
npm run dev

# Или production режим
npm start
```

Сервер запустится на **http://localhost:3001**

### 5. Проверка работы

Откройте в браузере или используйте curl:

```bash
# Проверка здоровья сервера
curl http://localhost:3001/health

# Получить всех персонажей
curl http://localhost:3001/api/characters

# Получить все программы
curl http://localhost:3001/api/programs

# Рассчитать стоимость
curl -X POST http://localhost:3001/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "selectedCharacters": [1, 2],
    "selectedPrograms": [
      {"programId": 1, "duration": 2}
    ]
  }'
```

## Возможные проблемы

### Ошибка: "Failed to fetch engine file"

Если видите ошибку про Prisma binaries:
```bash
# Попробуйте с игнорированием проверки
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push
```

### База данных не создалась

Проверьте файл `.env`:
```env
DATABASE_URL="file:./dev.db"
```

Убедитесь, что у вас есть права на запись в папку backend.

### Порт 3001 занят

Измените порт в `.env`:
```env
PORT=3002
```

## Просмотр данных в БД

Prisma Studio - графический интерфейс для просмотра и редактирования данных:

```bash
npm run db:studio
```

Откроется браузер на http://localhost:5555

## Следующие шаги

После запуска бэкенда:

1. ✅ Бэкенд работает на localhost:3001
2. 🎨 Настроить фронтенд для работы с API
3. 🎭 Создать модальные окна для выбора персонажей
4. 📝 Интегрировать форму заказа с API

См. файл `FRONTEND_INTEGRATION.md` для инструкций по интеграции с фронтендом.
