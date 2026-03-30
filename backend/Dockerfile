FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
# Dùng nodemon để hot-reload khi dev
CMD ["npx", "nodemon", "src/index.js"]