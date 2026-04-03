# Важливі деталі

Перед запуском необхідно завантажити PostgreSQL та створити базу даних Uevent, всі дані по типу пароля та порта на якому ваша бд в .env файл

_Для всієї інформації стосовно того який запит для чого використовується та що в нього передавати описані за допомогою Swagger_. Для того, щоб відкрити його запустіть сервер та перейдіть в Google за запитом

```http
http://localhost:3000/api/docs
```

(Не забудьте перевірити чи точно на цьому порту у вас запущенний сервер)

## .env Файл

NODE_ENV=development визначає чи буде логуватисчя кожна помилка та чи буде змінюватися бд від змін у файлах .entity

```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

JWT_SECRET=secret_string
JWT_REFRESH_SECRET=different_secret_string

DB_HOST=localhost
DB_PORT=ваш_порт
DB_USERNAME=ваше ім`я користувача в postgre, за замовчуванням: postgres
DB_PASSWORD=ваш пароль від postgre
DB_NAME=Uevent

SMTP_SERVICE=gmail
SMTP_USER=ваша_пошта
SMTP_PASS=пароль_який_дав_гугл
HOST_FOR_EMAIL=хост_фронту_для_поштових_повідомлень
PORT_FOR_EMAIL=порт_фронту_для_поштових_повідомлень
STRIPE_SECRET_KEY=sk_test_51THnCzC8SyWrLBoc2kJx6KwTDDr34ZWLqOwbwbOYexzZKdUPPnzbAGApe6Y35j8N4B0ffUZuezocas6iuBJnaGQZ00XJg9fgSU
USE_FAKE_PAYMENTS=true

GOOGLE_CLIENT_ID=google_id_for_google_OAuth
GOOGLE_CLIENT_SECRET=google_secret_for_google_OAuth
GOOGLE_CALLBACK_URL=http://your_backend_host_and_port/api/auth/google/callback
```

# Запуск

```bash
npm install
npm run start
```
