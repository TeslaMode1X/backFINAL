FROM node:22

WORKDIR /app

COPY . .

# Переходим в папку server и устанавливаем зависимости
WORKDIR /app/server
RUN npm install

EXPOSE 3030

CMD ["npm", "start"]
