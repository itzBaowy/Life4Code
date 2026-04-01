import express from 'express';
import authRouter from './auth.router.js';
import courseRouter from './course.router.js';



const rootRouter = express.Router()

rootRouter.use("/auth", authRouter)
rootRouter.use('/course', courseRouter)


export default rootRouter;