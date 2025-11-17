# Holiday Agency Backend API

Backend сервер для сайта агентства праздников с персонажами и программами.

## 🚀 Технологии

- **Node.js** + **Express** - backend framework
- **Prisma** - ORM для работы с БД
- **SQLite** - база данных (можно заменить на PostgreSQL)
- **CORS** - для работы с фронтендом

## 📦 Установка

```bash
# Установить зависимости
npm install

# Создать базу данных
npm run db:push

# Заполнить БД данными из JSON файлов
npm run seed
```

## 🏃 Запуск

```bash
# Development режим (с автоперезагрузкой)
npm run dev

# Production режим
npm start
```

Сервер запустится на http://localhost:3001

## 📚 API Endpoints

### Characters (Персонажи)

- `GET /api/characters` - Получить всех персонажей
- `GET /api/characters/:id` - Получить персонажа по ID
- `GET /api/characters/slug/:slug` - Получить персонажа по slug
- `POST /api/characters` - Создать персонажа
- `PUT /api/characters/:id` - Обновить персонажа
- `DELETE /api/characters/:id` - Удалить персонажа

### Programs (Программы)

- `GET /api/programs` - Получить все программы
- `GET /api/programs/:id` - Получить программу по ID
- `GET /api/programs/slug/:slug` - Получить программу по slug
- `POST /api/programs` - Создать программу
- `PUT /api/programs/:id` - Обновить программу
- `DELETE /api/programs/:id` - Удалить программу

### Calculator (Калькулятор стоимости)

- `POST /api/calculator/calculate` - Рассчитать стоимость заказа

**Request body:**
```json
{
  "selectedCharacters": [1, 2],
  "selectedPrograms": [
    { "programId": 1, "duration": 2 },
    { "programId": 5, "duration": 0.5 }
  ]
}
```

**Response:**
```json
{
  "totalPrice": 18000,
  "totalDuration": 2.5,
  "details": [...],
  "conflicts": [...],
  "hasConflicts": true
}
```

- `POST /api/calculator/resolve` - Пересчитать с учетом разрешения конфликтов

**Request body:**
```json
{
  "selectedCharacters": [1, 2],
  "selectedPrograms": [{ "programId": 1, "duration": 2 }],
  "resolutions": [
    {
      "programId": 1,
      "type": "sequential",
      "timeSlots": [
        { "characterId": 1, "startTime": 0, "endTime": 1 },
        { "characterId": 2, "startTime": 1, "endTime": 2 }
      ]
    }
  ]
}
```

### Orders (Заказы)

- `GET /api/orders` - Получить все заказы
- `GET /api/orders/:id` - Получить заказ по ID
- `POST /api/orders` - Создать заказ
- `PUT /api/orders/:id` - Обновить заказ
- `PATCH /api/orders/:id/status` - Обновить статус заказа
- `DELETE /api/orders/:id` - Удалить заказ

## 🗄️ Схема базы данных

### Character (Персонаж)
- id, name, slug, category
- hourlyPrice - цена за час работы
- description, mainImage, gallery
- availablePrograms - JSON массив ID программ
- isActive

### Program (Программа)
- id, name, slug, category, emoji
- basePrice, priceUnit, isCharacterPrice
- defaultCharacterId - персонаж по умолчанию
- description, fullDescription, bonus
- duration, targetAge, slogan
- mainImage, gallery
- requiresCharacter, isActive

### Order (Заказ)
- id, customerName, customerPhone, customerEmail
- eventDate, eventAddress
- childAge, guestsCount
- totalPrice, totalDuration
- status: draft, pending, confirmed, completed, cancelled
- notes

### OrderItem (Элемент заказа)
- orderId, programId
- duration, price
- distributionType: sequential, simultaneous, custom

### OrderItemCharacter (Персонаж в элементе заказа)
- orderItemId, characterId
- isDefaultCostume - в дефолтном костюме?
- requiresSeparateActor - нужен отдельный актер?

### TimeSlot (Временной слот)
- orderId, orderItemId, characterId
- startTime, endTime
- priceForSlot

## 🔧 Полезные команды

```bash
# Открыть Prisma Studio (GUI для БД)
npm run db:studio

# Сгенерировать Prisma Client заново
npm run db:generate

# Создать миграцию
npm run db:migrate
```

## 🌐 Переменные окружения

Создайте файл `.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
```

## 📝 Логика работы

### Сценарии распределения персонажей:

1. **Несколько персонажей на одну программу**
   - Все вместе (simultaneous)
   - По очереди (sequential) - с временными слотами

2. **Программа с дефолтным персонажем**
   - Использовать выбранного персонажа
   - Переодевание (same actor)
   - Отдельный актер (separate actor)

3. **Программа без выбора персонажа**
   - Автоматически назначается персонаж по умолчанию
