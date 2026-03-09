# Важливі деталі

Перед запуском необхідно завантажити PostgreSQL та створити базу даних Uevent, всі дані по типу пароля та порта на якому ваша бд в .env файл

## .env Файл

NODE_ENV=development визначає чи буде логуватисчя кожна помилка та чи буде змінюватися бд від змін у файлах .entity

```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=ваш порт
DB_USERNAME=ваше ім'я користувача в postgre, за замовчуванням: postgres
DB_PASSWORD=ваш пароль від postgre
DB_NAME=Uevent
```

# Запуск

```bash
npm install
npm run start
```
