import express from 'express';
import authRouter from './auth.router.js';
import courseRouter from './course.router.js';
import userRouter from './user.router.js';
import roleRouter from './role.router.js';



const rootRouter = express.Router()

rootRouter.use("/auth", authRouter)
rootRouter.use('/course', courseRouter)
rootRouter.use('/users', userRouter)
rootRouter.use('/roles', roleRouter)


export default rootRouter;