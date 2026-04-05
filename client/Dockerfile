# Етап 1: Збірка React + Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Етап 2: Запуск через Nginx
FROM nginx:alpine
# Копіюємо готові файли Vite з папки dist
COPY --from=build /app/dist /usr/share/nginx/html
# Копіюємо конфіг Nginx (створимо його наступним кроком)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
