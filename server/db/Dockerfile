FROM mongo:6

# Устанавливаем MongoDB Shell
RUN apt-get update && apt-get install -y wget gnupg && \
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-mongosh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем миграции в контейнер
COPY mongo_migrations /migrations
COPY run-migrations.js /app/run-migrations.js

# Запускаем миграции с использованием mongosh
CMD ["mongosh", "--username", "mongo", "--password", "mongo", "--authenticationDatabase", "admin", "mongodb://mongo:27017/cities", "/app/run-migrations.js"]

# MONGO_INITDB_ROOT_USERNAME=mongo
# MONGO_INITDB_ROOT_PASSWORD=mongo
# MONGO_INITDB_DATABASE=cities
# MONGO_PORT=27020
# MONGO_URI=mongodb://mongo:27017/${MONGO_INITDB_DATABASE}