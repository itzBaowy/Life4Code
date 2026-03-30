FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Dùng nodemon để hot-reload khi dev
CMD ["npm", "run", "dev"]