# Sử dụng Node.js bản nhẹ
FROM node:18-alpine
WORKDIR /app
# Copy file cấu hình và cài package
COPY package*.json ./
RUN npm install
# Copy toàn bộ source code
COPY . .
# Expose port mặc định của Vite
EXPOSE 5173
# Chạy app (thêm --host để Docker có thể map port ra ngoài)
CMD ["npm", "run", "dev", "--", "--host"]