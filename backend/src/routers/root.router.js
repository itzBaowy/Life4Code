import express from 'express';
import authRouter from './auth.router.js';
import courseRouter from './course.router.js';
import userRouter from './user.router.js';



const rootRouter = express.Router()

rootRouter.use("/auth", authRouter)
rootRouter.use('/course', courseRouter)
rootRouter.use('/users', userRouter)


export default rootRouter;