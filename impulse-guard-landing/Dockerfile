FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY project.inlang ./
#COPY .paraglide ./

RUN npm install

COPY . .

RUN npm run build

RUN find .next -name "ua*" && ls -la .next/server/pages

EXPOSE 3000

CMD ["npm", "run", "start"]