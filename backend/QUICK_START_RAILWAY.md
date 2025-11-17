# 🚀 Быстрый старт на Railway (5 минут)

## 1️⃣ Запушить код (уже сделано ✅)

Все файлы готовы и должны быть запушены в GitHub.

## 2️⃣ Создать проект на Railway

1. Откройте https://railway.app/dashboard
2. **New Project** → **Deploy from GitHub repo**
3. Выберите `paneok/paneok.github.io`
4. **Settings** → **Root Directory** → укажите: `backend`

## 3️⃣ Добавить переменные окружения

**Variables** → добавьте 3 переменные:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `file:./prod.db` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://paneok.github.io` |

## 4️⃣ Подождать деплой

Railway автоматически задеплоит проект. Следите за логами.

✅ Должны увидеть:
```
✅ Imported 120 characters
✅ Imported 26 programs
🚀 Server is running on port 3001
```

## 5️⃣ Получить URL

**Settings** → **Networking** → **Generate Domain**

Скопируйте URL вида: `https://ваш-проект.up.railway.app`

## 6️⃣ Проверить API

Откройте в браузере:
```
https://ваш-проект.up.railway.app/health
```

Должно вернуть: `{"status":"ok",...}`

## 7️⃣ Обновить фронтенд

Отредактируйте `js/api-client.js` в корне проекта:

```javascript
// Строка 343 (в конце файла)
window.apiClient = new ApiClient('https://ваш-проект.up.railway.app');
```

Запушьте изменение:
```bash
git add js/api-client.js
git commit -m "Подключен Railway API"
git push
```

## 8️⃣ Готово! 🎉

Откройте: https://paneok.github.io

Модальные окна должны работать!

---

**Подробная инструкция:** См. `RAILWAY_DEPLOY.md`
