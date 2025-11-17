# 🚂 Деплой на Railway - Пошаговая инструкция

## ✅ Что уже готово

Все файлы для деплоя созданы:
- ✅ `railway.json` - конфигурация Railway
- ✅ `.railwayignore` - исключения для деплоя
- ✅ `package.json` - с правильными скриптами
- ✅ `src/server.js` - с поддержкой PORT из env

## 📋 Шаг 1: Запушить изменения (если еще не сделано)

```bash
cd /path/to/paneok.github.io
git add .
git commit -m "Добавлена конфигурация для Railway"
git push
```

## 🚀 Шаг 2: Создать проект на Railway

### Вариант A: Через Dashboard (рекомендую)

1. Откройте https://railway.app/dashboard
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Найдите репозиторий **`paneok/paneok.github.io`**
5. Выберите его

### Важно! Railway должен определить папку `backend`

Если Railway не видит папку `backend`:
1. В настройках проекта нажмите **Settings**
2. Найдите **Root Directory**
3. Укажите: `backend`
4. Сохраните

## 🔧 Шаг 3: Настроить переменные окружения

В Railway Dashboard → Ваш проект → **Variables**:

Добавьте следующие переменные:

```env
# База данных (Railway автоматически создаст файл)
DATABASE_URL=file:./prod.db

# Порт (Railway автоматически подставит, но на всякий случай)
PORT=3001

# Окружение
NODE_ENV=production

# CORS - ваш домен GitHub Pages
ALLOWED_ORIGINS=https://paneok.github.io,http://localhost:5500
```

### Как добавить переменные:

1. Нажмите **"New Variable"**
2. Введите имя (например, `DATABASE_URL`)
3. Введите значение (например, `file:./prod.db`)
4. Нажмите **"Add"**
5. Повторите для всех переменных

## 📦 Шаг 4: Запустить деплой

Railway автоматически начнет деплой после добавления переменных.

**Что произойдет:**
1. Railway склонирует ваш репозиторий
2. Установит зависимости (`npm install`)
3. Сгенерирует Prisma Client (`npx prisma generate`)
4. Создаст БД (`npm run db:push`)
5. Импортирует данные из JSON (`npm run seed`)
6. Запустит сервер (`npm start`)

**Следите за логами:**
- В Railway Dashboard → **Deployments** → нажмите на деплой
- Смотрите логи в реальном времени

**Успешный деплой покажет:**
```
🚀 Server is running on port 3001
📍 Environment: production
🔗 Health check: http://localhost:3001/health
```

## 🌐 Шаг 5: Получить URL бэкенда

После успешного деплоя:

1. В Railway Dashboard → ваш проект
2. Перейдите в **Settings**
3. Найдите раздел **Networking**
4. Нажмите **"Generate Domain"**
5. Railway создаст домен вида: `your-app-name.up.railway.app`

**Скопируйте этот URL!** Он понадобится для фронтенда.

Пример: `https://paneok-backend.up.railway.app`

## 🧪 Шаг 6: Протестировать API

Откройте в браузере:

```
https://ваш-домен.up.railway.app/health
```

Должно вернуться:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T..."
}
```

Проверьте персонажей:
```
https://ваш-домен.up.railway.app/api/characters
```

Должен вернуться JSON массив с персонажами.

## 🔗 Шаг 7: Подключить фронтенд

### 7.1 Обновить API клиент

Отредактируйте `js/api-client.js`:

```javascript
// БЫЛО:
window.apiClient = new ApiClient('http://localhost:3001');

// СТАЛО (используйте ваш домен Railway):
window.apiClient = new ApiClient('https://ваш-домен.up.railway.app');
```

### 7.2 Запушить изменения

```bash
git add js/api-client.js
git commit -m "Подключен production API на Railway"
git push
```

### 7.3 Обновить CORS на бэкенде

В Railway Dashboard → Variables → обновите `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://paneok.github.io
```

Сохраните. Railway автоматически передеплоит.

## ✨ Готово!

Теперь откройте https://paneok.github.io

**Модальные окна должны работать!** 🎉

## 🔍 Проблемы и решения

### Проблема 1: "Failed to deploy"

**Решение:**
- Проверьте логи деплоя в Railway
- Убедитесь, что Root Directory = `backend`
- Проверьте, что все переменные окружения добавлены

### Проблема 2: "Backend is offline" на фронтенде

**Решение:**
- Проверьте, что домен Railway сгенерирован
- Откройте `https://ваш-домен.up.railway.app/health` в браузере
- Проверьте CORS в переменных окружения
- Проверьте URL в `js/api-client.js`

### Проблема 3: База данных пустая

**Решение:**
В Railway → Deployments → откройте последний деплой → найдите в логах:
```
✅ Imported 120 characters
✅ Imported 26 programs
```

Если этого нет - проверьте, что `npm run seed` выполнился.

### Проблема 4: CORS ошибка

**Решение:**
1. В Railway Variables → `ALLOWED_ORIGINS`
2. Убедитесь, что там указан ваш домен: `https://paneok.github.io`
3. БЕЗ слэша в конце!
4. Сохраните → Railway передеплоит

### Проблема 5: "Cannot find module prisma"

**Решение:**
Railway должен запустить `npx prisma generate` в билде.
Проверьте `railway.json` → `buildCommand`.

## 📊 Мониторинг

Railway автоматически показывает:
- CPU usage
- Memory usage
- Network traffic
- Deployment logs

Проверяйте в Dashboard → Metrics

## 💰 Бесплатные лимиты Railway

- ✅ 500 часов/месяц runtime
- ✅ Unlimited deployments
- ✅ 100GB network traffic

Для вашего проекта этого **более чем достаточно**!

## 🎯 Следующие шаги

После успешного деплоя:

1. ✅ Проверьте все 3 сценария модальных окон
2. ✅ Протестируйте расчет стоимости
3. ✅ Проверьте на мобильных устройствах
4. ⭐ Поделитесь ссылкой с клиентами!

---

**Нужна помощь?** Пишите в Issues: https://github.com/paneok/paneok.github.io/issues
