# Вибираємо образ Node.js для ARM (Raspberry Pi)
FROM node:20-alpine

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо ВСІ залежності (не тільки production)
RUN npm install

# Копіюємо код
COPY . .

# Компільовуємо NestJS (якщо використовуєш TypeScript)
RUN npm run build

# Очищаємо зайві dev-залежності для зменшення розміру образу
RUN npm prune --omit=dev

# Відкриваємо порт
EXPOSE 4000

# Запускаємо додаток
CMD ["npm", "run", "start:prod"]
