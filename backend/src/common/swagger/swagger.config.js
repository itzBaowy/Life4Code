// Cấu hình Swagger (Tài liệu API)
import dotenv from 'dotenv';
dotenv.config();
const mode = process.env.MODE;
const PORT = process.env.PORT;
export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Code4Life API Documentation',
            version: '1.0.0',
            description: 'Document API the project',
        },
        servers: [
            mode === 'development'
                ? { url: `http://localhost:${PORT}`, description: 'Development server' }
                : { url: 'https://life4-code.vercel.app', description: 'Production server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Input Access Token to access this API',
                },
            },
        },
    },
    // Đường dẫn đến các file chứa comment @swagger
    apis: ['./src/routers/*.js'],
};
