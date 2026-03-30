import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT;
const swaggerDocs = swaggerJsdoc(swaggerOptions);


app.set('trust proxy', true);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors());           // Cho phép FE gọi API
app.use(express.json());   // Đọc được body JSON

// Khai báo Routes
app.use('/api', rootRouter);

// Middleware xử lí các roule không tìm thấy
app.use((req, res, next) => {
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip;

    // Bỏ qua các request không quan trọng (favicon, robots.txt, etc.)
    // Browser tự động request favicon.ico khi truy cập trang web
    // Không cần throw error cho những request này
    if (url === '/favicon.ico' || url === '/robots.txt') {
        return res.status(404).end(); // Trả về 404 một cách im lặng
    }
    // Throw NotFoundException cho các route không tồn tại
    throw new NotFoundException();
});
app.use(appErorr);
const httpServer = createServer(app);
initSocket(httpServer);
// Khởi chạy Server
httpServer.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`📄 Swagger Docs at http://localhost:${PORT}/api-docs`);
    console.log(`-----------------------------------------`);
});